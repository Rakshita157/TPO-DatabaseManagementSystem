const express = require("express");
const router = express.Router();

const {
  getCollegeSettings,
  updateCollegeSettings,

  addFacultyCoordinator,
  deleteFacultyCoordinator,

  addStudentCoordinator,
  deleteStudentCoordinator,
} = require("../controllers/collegeSettings.controller");

// College Setting
router.get("/", getCollegeSettings);
router.put("/", updateCollegeSettings);

// Faculty Coordinators
router.post("/faculty", addFacultyCoordinator);
router.delete("/faculty/:id", deleteFacultyCoordinator);

// Student Coordinators
router.post("/student-coordinators", addStudentCoordinator);
router.delete("/student-coordinators/:userId", deleteStudentCoordinator);

module.exports = router;