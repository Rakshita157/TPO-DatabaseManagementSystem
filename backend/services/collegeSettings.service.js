const prisma = require("../config/prisma");

const getCollegeSettings = async () => {
  return await prisma.collegeSettings.findFirst();
};

const updateCollegeSettings = async (data) => {
  const collegeSettings = await prisma.collegeSettings.update({
    where: {
      id: 1,
    },
    data,
  });

  return collegeSettings;
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
    data,
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
        include: {
          studentProfile: true,
        },
      },
    },
  });
};

const addStudentCoordinator = async (userId) => {
  return await prisma.studentCoordinator.create({
    data: {
      userId,
    },
  });
};

const deleteStudentCoordinator = async (userId) => {
  return await prisma.studentCoordinator.delete({
    where: {
      userId,
    },
  });
};

module.exports = {
  getCollegeSettings,
  updateCollegeSettings,

  getFacultyCoordinators,
  addFacultyCoordinator,
  deleteFacultyCoordinator,

  getStudentCoordinators,
  addStudentCoordinator,
  deleteStudentCoordinator,
};