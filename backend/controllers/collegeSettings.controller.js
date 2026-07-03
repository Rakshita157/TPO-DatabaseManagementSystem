const prisma = require("../config/prisma");

const getCollegeSettings = async (req, res) => {
  try {
    const collegeSettings = await prisma.collegeSettings.findFirst();

    res.json(collegeSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCollegeSettings,
};