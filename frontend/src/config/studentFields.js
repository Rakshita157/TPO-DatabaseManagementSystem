export const EXCLUDED_FIELDS = new Set([
  'createdAt', 'updatedAt', 'userId',
  'placementStatus', 'profileStatus', 'isVerified',
]);

export const RELATION_FIELDS = new Set(['user', 'semesterResults', 'document']);

export const COURSE_LABELS = { BTECH: 'B.Tech', MTECH: 'M.Tech', MBA: 'MBA', MCA: 'MCA' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatFieldValue(value, formatter) {
  if (value === null || value === undefined) return null;
  switch (formatter) {
    case 'date': return formatDate(value);
    case 'decimal2': return Number(value).toFixed(2);
    case 'percent': return `${Number(value).toFixed(2)}%`;
    case 'course': return COURSE_LABELS[value] || value;
    default: return String(value);
  }
}

export function getFieldValue(fieldDef, profile, user, document) {
  if (fieldDef.source === 'user') return user?.[fieldDef.key];
  if (fieldDef.source === 'document') return document?.[fieldDef.key];
  return profile?.[fieldDef.key];
}

function autoLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

export const FIELD_SECTIONS = [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: 'User',
    iconClass: '',
    editKey: 'personal',
    primaryCount: 4,
    fields: [
      { key: 'fullName', label: 'Full Name', source: 'user' },
      { key: 'dob', label: 'Date of Birth', formatter: 'date' },
      { key: 'gender', label: 'Gender' },
      { key: 'aadharNumber', label: 'Aadhar Number' },
      { key: 'panNumber', label: 'PAN Number', fallback: 'N/A' },
    ],
  },
  {
    id: 'academic',
    title: 'Academic Information',
    icon: 'GraduationCap',
    iconClass: 'green',
    editKey: 'academic',
    primaryCount: 4,
    hasSGPA: true,
    fields: [
      { key: 'btuRollNumber', label: 'University Roll No.' },
      { key: 'enrollmentNumber', label: 'Enrollment No.' },
      { key: 'course', label: 'Course', formatter: 'course' },
      { key: 'department', label: 'Department', fallback: 'N/A' },
      { key: 'collegeId', label: 'College ID' },
      { key: 'admissionYear', label: 'Admission Year' },
      { key: 'graduationYear', label: 'Graduation Year' },
      { key: 'currentYear', label: 'Current Year' },
      { key: 'currentSemester', label: 'Current Semester' },
      { key: 'cgpa', label: 'CGPA', formatter: 'decimal2' },
      { key: 'activeBacklogs', label: 'Active Backlogs' },
      { key: 'passiveBacklogs', label: 'Passive Backlogs' },
    ],
  },
  {
    id: 'school',
    title: 'School Information',
    icon: 'GraduationCap',
    iconClass: 'orange',
    editKey: 'academic',
    primaryCount: 6,
    fields: [
      { key: 'tenthBoard', label: '10th Board' },
      { key: 'tenthPercentage', label: '10th Percentage', formatter: 'percent' },
      { key: 'tenthYear', label: '10th Passing Year' },
      { key: 'twelfthBoard', label: '12th Board' },
      { key: 'twelfthPercentage', label: '12th Percentage', formatter: 'percent' },
      { key: 'twelfthYear', label: '12th Passing Year' },
      { key: 'diplomaPercentage', label: 'Diploma Percentage', formatter: 'percent', optional: true },
      { key: 'diplomaYear', label: 'Diploma Year', optional: true },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: 'Phone',
    iconClass: 'orange',
    editKey: 'contact',
    primaryCount: 3,
    fields: [
      { key: 'collegeEmail', label: 'College Email', source: 'user' },
      { key: 'phoneNumber', label: 'Mobile Number' },
      { key: 'whatsappNumber', label: 'WhatsApp Number' },
      { key: 'alternatePhone', label: 'Alternate Phone', optional: true },
      { key: 'alternateEmail', label: 'Personal Email', optional: true },
    ],
  },
  {
    id: 'address',
    title: 'Current Address & Location',
    icon: 'MapPin',
    iconClass: '',
    editKey: 'address',
    primaryCount: 4,
    fields: [
      { key: 'currentAddress', label: 'Current Address' },
      { key: 'permanentAddress', label: 'Permanent Address' },
      { key: 'nativeCity', label: 'City' },
      { key: 'nativeDistrict', label: 'District' },
      { key: 'nativeState', label: 'State' },
    ],
  },
  {
    id: 'resume',
    title: 'Resume & LinkedIn',
    icon: 'FileText',
    iconClass: 'purple',
    editKey: 'resume',
    primaryCount: 2,
    fields: [
      { key: 'resumeUrl', label: 'Resume', source: 'document', renderer: 'resumeLink' },
      { key: 'linkedinUrl', label: 'LinkedIn URL', renderer: 'link', linkLabel: 'LinkedIn Profile' },
    ],
  },
];

export function getVisibleFields(section, profile, user, document) {
  const fields = [];
  for (const fieldDef of section.fields) {
    const value = getFieldValue(fieldDef, profile, user, document);
    if (value === undefined) continue;
    if (fieldDef.optional && (value === null || value === '')) continue;
    fields.push({ ...fieldDef, value });
  }
  return fields;
}

export function getExtraFields(profile, user, document) {
  const renderedKeys = new Set();
  FIELD_SECTIONS.forEach(section => {
    section.fields.forEach(f => renderedKeys.add(f.key));
  });

  const extras = [];
  const sources = [
    { data: profile, source: 'profile' },
    { data: user, source: 'user' },
    { data: document, source: 'document' },
  ];

  for (const { data } of sources) {
    if (!data) continue;
    for (const key of Object.keys(data)) {
      if (
        renderedKeys.has(key) ||
        EXCLUDED_FIELDS.has(key) ||
        RELATION_FIELDS.has(key)
      ) continue;
      const val = data[key];
      if (val === undefined || val === null) continue;
      extras.push({ key, label: autoLabel(key), value: val });
    }
  }
  return extras;
}
