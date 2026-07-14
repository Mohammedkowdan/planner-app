const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        const files = fs.readdirSync(path.join(__dirname, '../docs')).filter(f => f.endsWith('.xlsx'));
        const file = files[0];
        const filePath = path.join(__dirname, '../docs', file);
        
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const sheet = workbook.getWorksheet('1') || workbook.worksheets[0];
        console.log("Reading sheet:", sheet.name);

        for (let r = 1; r <= 30; r++) {
            const row = sheet.getRow(r);
            if (!row.values || !row.values.length) continue;
            
            let rowStr = `Row ${r}: `;
            for (let c = 1; c <= 15; c++) {
                const cell = row.getCell(c);
                if (cell && cell.value) {
                    rowStr += `[Col ${c}: ${JSON.stringify(cell.value)}] `;
                }
            }
            if (rowStr !== `Row ${r}: `) {
                console.log(rowStr);
            }
        }
    } catch(e) {
        console.error(e);
    }
}
main();
