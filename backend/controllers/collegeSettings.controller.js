const {
  getCollegeSettings: getCollegeSettingsService,
  updateCollegeSettings: updateCollegeSettingsService,

  getFacultyCoordinators: getFacultyCoordinatorsService,
  addFacultyCoordinator: addFacultyCoordinatorService,
  deleteFacultyCoordinator: deleteFacultyCoordinatorService,

  getStudentCoordinators: getStudentCoordinatorsService,
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
    const faculty = await addFacultyCoordinatorService(req.body);

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
    await deleteFacultyCoordinatorService(Number(req.params.id));

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

  addFacultyCoordinator,
  deleteFacultyCoordinator,

  addStudentCoordinator,
  deleteStudentCoordinator,
};