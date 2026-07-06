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

module.exports = {
  getCollegeSettings,
  updateCollegeSettings,
};