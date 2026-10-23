const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");

const COORDINATORS_DIR = path.join(__dirname, "..", "uploads", "coordinators");

const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, "..", filePath);
  fs.unlink(fullPath, () => {});
};

const getCollegeSettings = async () => {
  return await prisma.collegeSettings.findFirst();
};

const updateCollegeSettings = async (data) => {
  const existing = await prisma.collegeSettings.findFirst();

  if (existing) {
    return await prisma.collegeSettings.update({
      where: { id: existing.id },
      data,
    });
  }

  return await prisma.collegeSettings.create({
    data: {
      tpoHeadName: data.tpoHeadName || "",
      tpoHeadEmail: data.tpoHeadEmail || "",
      tpoHeadPhone: data.tpoHeadPhone || "",
      ...data,
    },
  });
};

// ================= FACULTY =================

const getFacultyCoordinators = async () => {
  return await prisma.facultyCoordinator.findMany({
    orderBy: {
      fullName: "asc",
    },
  });
};

const addFacultyCoordinator = async (data) => {
  return await prisma.facultyCoordinator.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      photo: data.photo,
    },
  });
};

const deleteFacultyCoordinator = async (id) => {
  return await prisma.facultyCoordinator.delete({
    where: {
      id,
    },
  });
};


// ================= STUDENT COORDINATORS =================

const getStudentCoordinators = async () => {
  return await prisma.studentCoordinator.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          collegeEmail: true,
          studentProfile: {
            select: {
              course: true,
              department: true,
              currentYear: true,
            },
          },
        },
      },
    },
  });
};

const getAvailableStudents = async ({ search, page, limit } = {}) => {
  const where = {
    role: "STUDENT",
    studentCoordinator: {
      is: null,
    },
  };

  if (search && typeof search === "string" && search.trim()) {
    const term = search.trim();
    where.OR = [
      { fullName: { contains: term } },
      { collegeEmail: { contains: term } },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));

  const [total, students] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: {
        id: "asc",
      },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      include: {
        studentProfile: true,
      },
    }),
  ]);

  return {
    students,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
};

const addStudentCoordinator = async (userId) => {
  const id = Number(userId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid user ID");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error("Student not found");
  }
  if (user.role !== "STUDENT") {
    throw new Error("Only students can be assigned as coordinators");
  }

  const existing = await prisma.studentCoordinator.findUnique({
    where: { userId: id },
  });
  if (existing) {
    throw new Error("Student is already assigned as a coordinator");
  }

  return await prisma.studentCoordinator.create({
    data: {
      userId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          collegeEmail: true,
          studentProfile: {
            select: {
              course: true,
              department: true,
              currentYear: true,
            },
          },
        },
      },
    },
  });
};

const deleteStudentCoordinator = async (userId) => {
  const id = Number(userId);

  const existing = await prisma.studentCoordinator.findUnique({
    where: { userId: id },
  });
  if (!existing) {
    throw new Error("Student coordinator not found");
  }

  return await prisma.studentCoordinator.delete({
    where: { userId: id },
  });
};

module.exports = {
  getCollegeSettings,
  updateCollegeSettings,

  getFacultyCoordinators,
  addFacultyCoordinator,
  deleteFacultyCoordinator,

  getStudentCoordinators,
  getAvailableStudents,
  addStudentCoordinator,
  deleteStudentCoordinator,
};