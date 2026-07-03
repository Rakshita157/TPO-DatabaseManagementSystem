const prisma = require("../config/prisma");

const getCollegeSettings = async () => {
  return await prisma.collegeSettings.findFirst();
};

module.exports = {
  getCollegeSettings,
};