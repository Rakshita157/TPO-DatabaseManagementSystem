function toCsvCell(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function generateStudentCsv(students, fieldDefs) {
  const headers = fieldDefs.map((f) => f.label);
  const rows = students.map((s) => fieldDefs.map((f) => toCsvCell(f.getValue(s))));
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];
  return "\uFEFF" + lines.join("\r\n");
}

module.exports = { generateStudentCsv };
