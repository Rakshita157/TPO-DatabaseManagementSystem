const path = require("path");
const fs = require("fs");
const {
  getCollegeSettings: getCollegeSettingsService,
  updateCollegeSettings: updateCollegeSettingsService,

  getFacultyCoordinators: getFacultyCoordinatorsService,
  addFacultyCoordinator: addFacultyCoordinatorService,
  deleteFacultyCoordinator: deleteFacultyCoordinatorService,

  getStudentCoordinators: getStudentCoordinatorsService,
  getAvailableStudents: getAvailableStudentsService,
  addStudentCoordinator: addStudentCoordinatorService,
  deleteStudentCoordinator: deleteStudentCoordinatorService,
} = require("../services/collegeSettings.service");

const getCollegeSettings = async (req, res) => {
  try {
    const collegeSettings = await getCollegeSettingsService();
    const facultyCoordinators = await getFacultyCoordinatorsService();
    const studentCoordinators = await getStudentCoordinatorsService();

    res.json({
      collegeSettings,
      facultyCoordinators,
      studentCoordinators,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addFacultyCoordinator = async (req, res) => {
  try {
    const data = {
      fullName: req.body.fullName,
      photo: req.file ? req.file.path.replace(/\\/g, "/") : null,
    };

    const faculty = await addFacultyCoordinatorService(data);

    res.status(201).json({
      message: "Faculty Coordinator added successfully",
      faculty,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteFacultyCoordinator = async (req, res) => {
  try {
    const deleted = await deleteFacultyCoordinatorService(Number(req.params.id));

    if (deleted.photo) {
      const filePath = path.join(__dirname, "..", deleted.photo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      message: "Faculty Coordinator deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const addStudentCoordinator = async (req, res) => {
  try {
    const { userId } = req.body;

    const coordinator = await addStudentCoordinatorService(userId);

    res.status(201).json({
      message: "Student Coordinator added successfully",
      coordinator,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteStudentCoordinator = async (req, res) => {
  try {
    await deleteStudentCoordinatorService(Number(req.params.userId));

    res.json({
      message: "Student Coordinator removed successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getAvailableStudents = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const result = await getAvailableStudentsService({ search, page, limit });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};


const updateCollegeSettings = async (req, res) => {
  try {
    const current = await getCollegeSettingsService();

    const data = { ...req.body };

    // Empty string values for optional text fields should not be persisted
    ["officeAddress", "officeHours"].forEach((key) => {
      if (data[key] === "") delete data[key];
    });

    const hasFile = Boolean(req.file);
    const clearPhoto = req.body.tpoHeadPhoto === "";

    if (hasFile || clearPhoto) {
      // Delete the previous photo file when it is replaced or removed
      if (current && current.tpoHeadPhoto) {
        const oldPath = path.join(__dirname, "..", current.tpoHeadPhoto);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      data.tpoHeadPhoto = hasFile
        ? req.file.path.replace(/\\/g, "/")
        : null;
    } else {
      delete data.tpoHeadPhoto;
    }

    const collegeSettings = await updateCollegeSettingsService(data);

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

  addFacultyCoordinator,
  deleteFacultyCoordinator,

  addStudentCoordinator,
  deleteStudentCoordinator,

  getAvailableStudents,
};