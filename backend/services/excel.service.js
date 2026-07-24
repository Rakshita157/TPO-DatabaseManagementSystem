const ExcelJS = require("exceljs");

const COLLEGE_NAME = "Government Mahila Engineering College, Ajmer";
const DEFAULT_GENDER = "Female";

const FIXED_HEADERS = [
  "Student Name",
  "Hostel Name",
  "Email",
  "University Roll Number",
  "College ID",
  "Current Address",
  "Permanent Address",
  "Mobile Number (WhatsApp)",
  "Alternate Mobile Number",
  "Date of Birth",
  "College Name",
  "Personal ID",
  "Branch",
  "Gender",
  "10th Percentage",
  "10th Passing Year",
  "10th Board",
  "12th Percentage",
  "12th Passing Year",
  "12th Board",
  "Diploma Percentage",
  "Diploma Passing Year",
  "UG Year of Passing",
  "Aadhaar Number",
  "PAN Number",
  "Active Backlogs",
  "Passive Backlogs",
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFixedRow(s) {
  return [
    s.user?.fullName || "",
    "",
    s.user?.collegeEmail || "",
    s.btuRollNumber || "",
    s.collegeId || "",
    s.currentAddress || "",
    s.permanentAddress || "",
    s.whatsappNumber || "",
    s.alternatePhone || "",
    formatDate(s.dob),
    COLLEGE_NAME,
    s.enrollmentNumber || "",
    s.department || "N/A",
    s.gender || DEFAULT_GENDER,
    s.tenthPercentage != null ? Number(s.tenthPercentage) : "",
    s.tenthYear || "",
    s.tenthBoard || "",
    s.twelfthPercentage != null ? Number(s.twelfthPercentage) : "",
    s.twelfthYear || "",
    s.twelfthBoard || "",
    s.diplomaPercentage != null ? Number(s.diplomaPercentage) : "N/A",
    s.diplomaYear || "N/A",
    s.graduationYear || "",
    s.aadharNumber || "",
    s.panNumber || "",
    s.activeBacklogs ?? "",
    s.passiveBacklogs ?? "",
  ];
}

function buildSgpaMap(student) {
  const map = {};
  if (student.semesterResults) {
    for (const sr of student.semesterResults) {
      map[sr.semester] = sr.sgpa != null ? Number(sr.sgpa) : null;
    }
  }
  return map;
}

function getMaxSemester(students) {
  let max = 0;
  for (const s of students) {
    if (s.semesterResults) {
      for (const sr of s.semesterResults) {
        if (sr.semester > max) max = sr.semester;
      }
    }
  }
  return max;
}

async function generateStudentExcel(students) {
  const maxSem = getMaxSemester(students);

  const sgpaHeaders = [];
  for (let i = 1; i <= maxSem; i++) {
    sgpaHeaders.push(`Sem ${i} SGPA`);
  }

  const allHeaders = [
    ...FIXED_HEADERS,
    ...sgpaHeaders,
    "Aggregate CGPA",
    "Resume Link",
    "Native City",
    "Native State",
  ];

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  sheet.columns = allHeaders.map((h) => ({ header: h, key: h, width: 20 }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A8A" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  for (const s of students) {
    const fixed = getFixedRow(s);
    const sgpaMap = buildSgpaMap(s);
    const sgpaValues = [];
    for (let i = 1; i <= maxSem; i++) {
      const val = sgpaMap[i];
      sgpaValues.push(val != null ? val : "");
    }

    const trailing = [
      s.cgpa != null ? Number(s.cgpa) : "",
      s.document?.resumeUrl || "",
      s.nativeCity || "",
      s.nativeState || "",
    ];

    sheet.addRow([...fixed, ...sgpaValues, ...trailing]);
  }

  for (let col = 1; col <= allHeaders.length; col++) {
    sheet.getColumn(col).alignment = { vertical: "middle", wrapText: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateStudentExcel };
