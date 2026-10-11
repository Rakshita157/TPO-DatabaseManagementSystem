const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/admin.middleware");
const { uploadImage } = require("../middleware/upload.middleware");

const {
  getCollegeSettings,
  updateCollegeSettings,

  addFacultyCoordinator,
  deleteFacultyCoordinator,

  addStudentCoordinator,
  deleteStudentCoordinator,

  getAvailableStudents,
} = require("../controllers/collegeSettings.controller");

// College Setting
router.get("/", getCollegeSettings);
router.put("/", updateCollegeSettings);

// Faculty Coordinators
router.post("/faculty", uploadImage.single("photo"), addFacultyCoordinator);
router.delete("/faculty/:id", deleteFacultyCoordinator);

// Student Coordinators
router.get("/available-students", requireAdmin, getAvailableStudents);
router.post("/student-coordinators", requireAdmin, addStudentCoordinator);
router.delete("/student-coordinators/:userId", requireAdmin, deleteStudentCoordinator);

module.exports = router;