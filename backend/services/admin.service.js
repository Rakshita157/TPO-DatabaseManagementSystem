const prisma = require("../config/prisma");

const getStudents = async ({ search, department, course, currentYear, currentSemester, admissionYear, graduationYear, gender, cgpaMin, cgpaMax, resumeUploaded, linkedinAdded, placementEligible, sortBy, sortOrder, page, limit }) => {
  const where = {
    user: { role: "STUDENT" },
  };

  if (search) {
    where.OR = [
      { user: { fullName: { contains: search } } },
      { user: { collegeEmail: { contains: search } } },
      { collegeId: { contains: search } },
      { btuRollNumber: { contains: search } },
      { enrollmentNumber: { contains: search } },
    ];
  }

  if (department) where.department = department;
  if (course) where.course = course;
  if (currentYear) where.currentYear = parseInt(currentYear);
  if (currentSemester) where.currentSemester = parseInt(currentSemester);
  if (admissionYear) where.admissionYear = parseInt(admissionYear);
  if (graduationYear) where.graduationYear = parseInt(graduationYear);
  if (gender) where.gender = gender;

  if (cgpaMin || cgpaMax) {
    where.cgpa = {};
    if (cgpaMin) where.cgpa.gte = parseFloat(cgpaMin);
    if (cgpaMax) where.cgpa.lte = parseFloat(cgpaMax);
  }

  if (resumeUploaded === "yes") {
    where.document = { isNot: null };
  } else if (resumeUploaded === "no") {
    where.document = { is: null };
  }

  if (linkedinAdded === "yes") {
    where.linkedinUrl = { not: null };
  } else if (linkedinAdded === "no") {
    where.linkedinUrl = null;
  }

  if (placementEligible === "yes") {
    where.activeBacklogs = 0;
  } else if (placementEligible === "no") {
    where.activeBacklogs = { gt: 0 };
  }

  const orderBy = {};
  if (sortBy === "name") {
    orderBy.user = { fullName: sortOrder || "asc" };
  } else if (sortBy === "cgpa") {
    orderBy.cgpa = sortOrder || "desc";
  } else if (sortBy === "year") {
    orderBy.currentYear = sortOrder || "desc";
  } else if (sortBy === "admissionYear") {
    orderBy.admissionYear = sortOrder || "desc";
  } else {
    orderBy.user = { fullName: "asc" };
  }

  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNum - 1) * pageSize;

  const [students, total] = await Promise.all([
    prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, collegeEmail: true, role: true } },
        document: { select: { resumeUrl: true } },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.studentProfile.count({ where }),
  ]);

  return {
    students,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

const getStudentById = async (userId) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: parseInt(userId) },
    include: {
      user: { select: { id: true, fullName: true, collegeEmail: true, role: true, createdAt: true } },
      semesterResults: { orderBy: { semester: "asc" } },
      document: true,
    },
  });
  return student;
};

const updateStudentProfile = async (userId, data) => {
  const profile = await prisma.studentProfile.update({
    where: { userId: parseInt(userId) },
    data,
  });
  return profile;
};

const updateUser = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: parseInt(userId) },
    data,
    select: { id: true, fullName: true, collegeEmail: true, role: true },
  });
  return user;
};

const deleteStudent = async (userId) => {
  await prisma.user.delete({
    where: { id: parseInt(userId) },
  });
};

const exportStudents = async (filters) => {
  const result = await getStudents({ ...filters, page: 1, limit: 10000, sortBy: "name", sortOrder: "asc" });
  return result.students;
};

const getFilterOptions = async () => {
  const departments = await prisma.studentProfile.findMany({
    where: { department: { not: null } },
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  });

  const admissionYears = await prisma.studentProfile.findMany({
    select: { admissionYear: true },
    distinct: ["admissionYear"],
    orderBy: { admissionYear: "desc" },
  });

  return {
    departments: departments.map((d) => d.department).filter(Boolean),
    courses: ["BTECH", "MTECH", "MBA", "MCA"],
    years: [1, 2, 3, 4],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    admissionYears: admissionYears.map((y) => y.admissionYear).sort((a, b) => b - a),
    genders: ["Male", "Female", "Other"],
  };
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudentProfile,
  updateUser,
  deleteStudent,
  exportStudents,
  getFilterOptions,
};
