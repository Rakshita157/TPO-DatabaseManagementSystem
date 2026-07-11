const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");

const {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,

  createSemesterResult,
  getSemesterResults,
  updateSemesterResult,

  getDocument,
  uploadDocument,
  updateDocument,
} = require("../controllers/studentProfile.controller");



router.get("/student-profile/:userId", verifyToken, getStudentProfile);
router.post("/student-profile", verifyToken, createStudentProfile);
router.put("/student-profile/:userId", verifyToken, updateStudentProfile);

router.post("/semester-results", verifyToken, createSemesterResult);
router.get("/semester-results/:userId", verifyToken, getSemesterResults);
router.put("/semester-results/:userId/:semester",verifyToken,updateSemesterResult);

router.get("/documents/:userId", verifyToken, getDocument);
router.post("/documents", verifyToken, uploadDocument);
router.put("/documents/:userId", verifyToken, updateDocument);

module.exports = router;