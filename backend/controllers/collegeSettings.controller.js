const {
  getCollegeSettings: getCollegeSettingsService,
} = require("../services/collegeSettings.service");

const getCollegeSettings = async (req, res) => {
  try {
    const collegeSettings = await getCollegeSettingsService();
    res.json(collegeSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCollegeSettings,
};