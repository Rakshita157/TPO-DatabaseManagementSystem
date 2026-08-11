const ExcelJS = require("exceljs");

async function generateStudentExcel(students, fieldDefs) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  sheet.columns = fieldDefs.map((f) => ({ header: f.label, key: f.label, width: 20 }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A8A" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  for (const s of students) {
    sheet.addRow(fieldDefs.map((f) => f.getValue(s)));
  }

  for (let col = 1; col <= fieldDefs.length; col++) {
    sheet.getColumn(col).alignment = { vertical: "middle", wrapText: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateStudentExcel };
