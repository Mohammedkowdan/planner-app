import ExcelJS from 'exceljs';
import { RawProjectData, RawLocationData, ParseResult } from './types';
import { normalizeArabicString } from './normalizers';

export async function parseAnnualReport(buffer: ArrayBuffer): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const result: ParseResult = {
    projects: [],
    issues: []
  };

  // 1. Iterate over all sheets (we expect 1..14 or more, plus Summary)
  for (const sheet of workbook.worksheets) {
    if (sheet.name.includes("الإجماليات") || sheet.name.includes("Summary") || sheet.state === 'hidden') {
      continue;
    }

    try {
      const projectData = extractProjectFromSheet(sheet, result);
      if (projectData && (projectData.projectName || projectData.sector)) {
        result.projects.push(projectData);
      }
    } catch (err: any) {
      result.issues.push({
        severity: 'ERROR',
        message: `فشل في تحليل الورقة: ${err.message}`,
        sheetName: sheet.name
      });
    }
  }

  return result;
}

function getCellValue(sheet: ExcelJS.Worksheet, rowObj: ExcelJS.Row | undefined, col: number): any {
    if (!rowObj) return null;
    let cell = rowObj.getCell(col);
    if (cell.isMerged && cell.master) {
      cell = cell.master;
    }
    let val = cell.value;
    if (val && typeof val === 'object' && 'richText' in val) {
      return (val as any).richText.map((t: any) => t.text).join(' ').trim();
    }
    if (val && typeof val === 'object' && 'result' in val) {
      return (val as any).result;
    }
    return val?.toString().trim() || null;
}

function extractProjectFromSheet(sheet: ExcelJS.Worksheet, result: ParseResult): RawProjectData | null {
  // Sector from Row 1
  const row1 = sheet.getRow(1);
  const rawSectorStr = getCellValue(sheet, row1, 1) || "";
  let sector = "";
  const sectorMatch = rawSectorStr.match(/قطاع\s*\((.*?)\)/);
  if (sectorMatch && sectorMatch[1]) {
    sector = normalizeArabicString(sectorMatch[1]);
  }

  // Project Name from Row 2
  const row2 = sheet.getRow(2);
  const rawTitleStr = getCellValue(sheet, row2, 1) || "";
  let projectName = rawTitleStr.replace(/اسم المشروع\s*:/, '').trim();

  // Basic Details from Row 5 (since they might be merged vertically for all project rows)
  const row5 = sheet.getRow(5);
  const donor = getCellValue(sheet, row5, 4);
  const brief = getCellValue(sheet, row5, 5);
  const outputs = getCellValue(sheet, row5, 6);
  const startDate = getCellValue(sheet, row5, 13);
  const endDate = getCellValue(sheet, row5, 14);
  const status = getCellValue(sheet, row5, 15);

  const locations: RawLocationData[] = [];

  // Rows 5 to at least 26 contain location data
  let rowIdx = 5;
  while (rowIdx <= 100) { // arbitrary limit to prevent infinite loops
    const r = sheet.getRow(rowIdx);
    if (!r || !r.values || !r.values.length) break;

    const no = getCellValue(sheet, r, 1);
    const rawGov = getCellValue(sheet, r, 2);
    
    // Stop condition: if governorate cell is empty or it's the totals row
    if (!rawGov || rawGov.includes('الإجماليات') || rawGov.includes('SUM')) {
        // usually totals row is 27
        if (!rawGov && !no) {
            rowIdx++;
            continue;
        }
        break;
    }

    const governorate = normalizeArabicString(rawGov);
    const district = normalizeArabicString(getCellValue(sheet, r, 3));
    const families = parseInt(getCellValue(sheet, r, 7)) || 0;
    const boys = parseInt(getCellValue(sheet, r, 8)) || 0;
    const girls = parseInt(getCellValue(sheet, r, 9)) || 0;
    const men = parseInt(getCellValue(sheet, r, 10)) || 0;
    const women = parseInt(getCellValue(sheet, r, 11)) || 0;

    // Check if row actually has data (sometimes templates leave standard names but 0 values)
    if (families > 0 || boys > 0 || girls > 0 || men > 0 || women > 0) {
        locations.push({
            governorate,
            district: district || undefined,
            families, boys, girls, men, women
        });
    }
    
    rowIdx++;
  }

  if (!projectName && !sector && locations.length === 0) {
      return null; // Empty sheet
  }

  if (!projectName) {
      result.issues.push({
          severity: 'WARNING',
          message: 'اسم المشروع مفقود',
          sheetName: sheet.name,
          rowNumber: 2
      });
      projectName = "مشروع غير مسمى";
  }

  return {
    sheetName: sheet.name,
    sector,
    projectName,
    donor,
    brief,
    outputs,
    startDate,
    endDate,
    status,
    locations
  };
}
