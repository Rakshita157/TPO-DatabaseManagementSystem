const COLLEGE_NAME = "Government Mahila Engineering College, Ajmer";
const DEFAULT_GENDER = "Female";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_ORDER = [
  "Personal Information",
  "Contact Information",
  "Academic Information",
  "School Information",
  "Address",
  "Resume & Documents",
  "Other",
];

const STATIC_EXPORT_FIELDS = [
  {
    key: "fullName",
    label: "Student Name",
    category: "Personal Information",
    getValue: (s) => s.user?.fullName || "",
  },
  {
    key: "hostelName",
    label: "Hostel Name",
    category: "Other",
    getValue: (s) => s.hostelName || "",
  },
  {
    key: "collegeEmail",
    label: "Email",
    category: "Contact Information",
    getValue: (s) => s.user?.collegeEmail || "",
  },
  {
    key: "btuRollNumber",
    label: "University Roll Number",
    category: "Academic Information",
    getValue: (s) => s.btuRollNumber || "",
  },
  {
    key: "collegeId",
    label: "College ID",
    category: "Academic Information",
    getValue: (s) => s.collegeId || "",
  },
  {
    key: "currentAddress",
    label: "Current Address",
    category: "Address",
    getValue: (s) => s.currentAddress || "",
  },
  {
    key: "permanentAddress",
    label: "Permanent Address",
    category: "Address",
    getValue: (s) => s.permanentAddress || "",
  },
  {
    key: "whatsappNumber",
    label: "Mobile Number (WhatsApp)",
    category: "Contact Information",
    getValue: (s) => s.whatsappNumber || "",
  },
  {
    key: "alternatePhone",
    label: "Alternate Mobile Number",
    category: "Contact Information",
    getValue: (s) => s.alternatePhone || "",
  },
  {
    key: "dob",
    label: "Date of Birth",
    category: "Personal Information",
    getValue: (s) => formatDate(s.dob),
  },
  {
    key: "collegeName",
    label: "College Name",
    category: "Other",
    getValue: () => COLLEGE_NAME,
  },
  {
    key: "enrollmentNumber",
    label: "Personal ID",
    category: "Academic Information",
    getValue: (s) => s.enrollmentNumber || "",
  },
  {
    key: "department",
    label: "Branch",
    category: "Academic Information",
    getValue: (s) => s.department || "N/A",
  },
  {
    key: "gender",
    label: "Gender",
    category: "Personal Information",
    getValue: (s) => s.gender || DEFAULT_GENDER,
  },
  {
    key: "tenthPercentage",
    label: "10th Percentage",
    category: "School Information",
    getValue: (s) => (s.tenthPercentage != null ? Number(s.tenthPercentage) : ""),
  },
  {
    key: "tenthYear",
    label: "10th Passing Year",
    category: "School Information",
    getValue: (s) => s.tenthYear || "",
  },
  {
    key: "tenthBoard",
    label: "10th Board",
    category: "School Information",
    getValue: (s) => s.tenthBoard || "",
  },
  {
    key: "twelfthPercentage",
    label: "12th Percentage",
    category: "School Information",
    getValue: (s) => (s.twelfthPercentage != null ? Number(s.twelfthPercentage) : ""),
  },
  {
    key: "twelfthYear",
    label: "12th Passing Year",
    category: "School Information",
    getValue: (s) => s.twelfthYear || "",
  },
  {
    key: "twelfthBoard",
    label: "12th Board",
    category: "School Information",
    getValue: (s) => s.twelfthBoard || "",
  },
  {
    key: "diplomaPercentage",
    label: "Diploma Percentage",
    category: "School Information",
    getValue: (s) => (s.diplomaPercentage != null ? Number(s.diplomaPercentage) : "N/A"),
  },
  {
    key: "diplomaYear",
    label: "Diploma Passing Year",
    category: "School Information",
    getValue: (s) => s.diplomaYear || "N/A",
  },
  {
    key: "graduationYear",
    label: "UG Year of Passing",
    category: "Academic Information",
    getValue: (s) => s.graduationYear || "",
  },
  {
    key: "aadharNumber",
    label: "Aadhaar Number",
    category: "Personal Information",
    getValue: (s) => s.aadharNumber || "",
  },
  {
    key: "panNumber",
    label: "PAN Number",
    category: "Personal Information",
    getValue: (s) => s.panNumber || "",
  },
  {
    key: "activeBacklogs",
    label: "Active Backlogs",
    category: "Academic Information",
    getValue: (s) => s.activeBacklogs ?? "",
  },
  {
    key: "passiveBacklogs",
    label: "Passive Backlogs",
    category: "Academic Information",
    getValue: (s) => s.passiveBacklogs ?? "",
  },
  {
    key: "cgpa",
    label: "Aggregate CGPA",
    category: "Academic Information",
    getValue: (s) => (s.cgpa != null ? Number(s.cgpa) : ""),
  },
  {
    key: "resumeUrl",
    label: "Resume Link",
    category: "Resume & Documents",
    getValue: (s) => s.document?.resumeUrl || "",
  },
  {
    key: "nativeCity",
    label: "Native City",
    category: "Address",
    getValue: (s) => s.nativeCity || "",
  },
  {
    key: "nativeState",
    label: "Native State",
    category: "Address",
    getValue: (s) => s.nativeState || "",
  },
];

function getSgpaMap(student) {
  const map = {};
  if (student.semesterResults) {
    for (const sr of student.semesterResults) {
      map[sr.semester] = sr.sgpa != null ? Number(sr.sgpa) : null;
    }
  }
  return map;
}

function getSgpaField(semester) {
  return {
    key: `sgpa_${semester}`,
    label: `Sem ${semester} SGPA`,
    category: "Academic Information",
    getValue: (s) => {
      const value = getSgpaMap(s)[semester];
      return value != null ? value : "";
    },
  };
}

function getSgpaFields(maxSemester) {
  const fields = [];
  for (let i = 1; i <= maxSemester; i++) {
    fields.push(getSgpaField(i));
  }
  return fields;
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

function getDefaultFieldDefs(students) {
  const defs = [];
  for (const field of STATIC_EXPORT_FIELDS) {
    if (field.key === "cgpa") {
      defs.push(...getSgpaFields(getMaxSemester(students)));
    }
    defs.push(field);
  }
  return defs;
}

function resolveFieldDefs(fieldKeys, students) {
  const maxSemester = getMaxSemester(students);
  const byKey = new Map(STATIC_EXPORT_FIELDS.map((f) => [f.key, f]));
  return fieldKeys
    .map((key) => {
      if (byKey.has(key)) return byKey.get(key);
      const match = key.match(/^sgpa_(\d+)$/);
      if (match && Number(match[1]) <= maxSemester) {
        return getSgpaField(Number(match[1]));
      }
      return null;
    })
    .filter(Boolean);
}

function getAvailableFields(maxSemester = 0) {
  const fields = [];
  for (const field of STATIC_EXPORT_FIELDS) {
    if (field.key === "cgpa") {
      for (const sgpa of getSgpaFields(maxSemester)) {
        fields.push({ key: sgpa.key, label: sgpa.label, category: sgpa.category });
      }
    }
    fields.push({ key: field.key, label: field.label, category: field.category });
  }
  const categories = CATEGORY_ORDER.filter((c) => fields.some((f) => f.category === c));
  return { categories, fields };
}

module.exports = {
  STATIC_EXPORT_FIELDS,
  getSgpaField,
  getSgpaFields,
  getMaxSemester,
  getDefaultFieldDefs,
  resolveFieldDefs,
  getAvailableFields,
};
