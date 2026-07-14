const ExcelJS = require('exceljs');

async function parse() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('G:\\Downloads at 20-5-2026\\معلومات التقرير السنوي 2025م للقطاعات (1).xlsx');
    
    workbook.eachSheet((worksheet, sheetId) => {
        console.log(`Sheet: ${worksheet.name} (ID: ${sheetId})`);
        
        let rowCount = 0;
        worksheet.eachRow((row, rowNumber) => {
            if (rowCount < 10) {
                console.log(`Row ${rowNumber}:`, JSON.stringify(row.values));
                rowCount++;
            }
        });
        console.log('---');
    });
}

parse().catch(console.error);
