const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/admin.middleware");
const {
  getStats,
  listStudents,
  getStudent,
  editStudentProfile,
  editUser,
  removeStudent,
  exportData,
  filters,
} = require("../controllers/admin.controller");

router.get("/stats", requireAdmin, getStats);
router.get("/students", requireAdmin, listStudents);
router.get("/students/export", requireAdmin, exportData);
router.get("/filters", requireAdmin, filters);
router.get("/students/:userId", requireAdmin, getStudent);
router.put("/students/:userId/profile", requireAdmin, editStudentProfile);
router.put("/students/:userId/user", requireAdmin, editUser);
router.delete("/students/:userId", requireAdmin, removeStudent);

module.exports = router;
