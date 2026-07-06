const {
  getCollegeSettings: getCollegeSettingsService,
  updateCollegeSettings: updateCollegeSettingsService,
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


const updateCollegeSettings = async (req, res) => {
  try {
    const collegeSettings = await updateCollegeSettingsService(req.body);

    res.json({
      message: "College settings updated successfully",
      collegeSettings,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCollegeSettings,
  updateCollegeSettings,
};