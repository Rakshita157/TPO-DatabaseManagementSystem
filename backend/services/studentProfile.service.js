const prisma = require("../config/prisma");

const getStudentProfile = async (userId) => {
          const profile = await prisma.studentProfile.findUnique({
    where: {
      userId,
    },
  });

  return profile;
};

const createStudentProfile = async (data) => {
 const profile = await prisma.studentProfile.create({
    data,
  });

  return profile;
};

const updateStudentProfile = async (userId, data) => {
  const profile = await prisma.studentProfile.update({
    where: {
      userId,
    },
    data,
  });

  return profile;
};

const createSemesterResult = async (data) => {
  const semesterResult = await prisma.semesterResult.create({
    data,
  });

  return semesterResult;
};

const getSemesterResults = async (userId) => {
  const semesterResults = await prisma.semesterResult.findMany({
    where: {
      userId,
    },
    orderBy: {
      semester: "asc",
    },
  });

  return semesterResults;
};

const updateSemesterResult = async (userId, semester, data) => {
  const semesterResult = await prisma.semesterResult.update({
    where: {
      userId_semester: {
        userId,
        semester,
      },
    },
    data,
  });

  return semesterResult;
};

const deleteSemesterResult = async (userId, semester) => {
  await prisma.semesterResult.delete({
    where: {
      userId_semester: {
        userId,
        semester,
      },
    },
  });
};

const getDocument = async (userId) => {
  const document = await prisma.document.findUnique({
    where: {
      userId,
    },
  });

  return document;
};

const uploadDocument = async (data) => {
  return await prisma.document.upsert({
    where: { userId: data.userId },
    update: data,
    create: data,
  });
};


const updateDocument = async (userId, data) => {
  const document = await prisma.document.update({
    where: {
      userId,
    },
    data,
  });

  return document;
};

module.exports = {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,

  getSemesterResults,
  createSemesterResult,
  updateSemesterResult,
  deleteSemesterResult,

  getDocument,
  uploadDocument,
  updateDocument,
};
