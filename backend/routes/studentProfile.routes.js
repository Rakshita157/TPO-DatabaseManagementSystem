const express = require("express");
const router = express.Router();

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

const upload = require("../middleware/upload.middleware");

router.get("/student-profile/:userId", getStudentProfile);
router.post("/student-profile", createStudentProfile);
router.put("/student-profile/:userId", updateStudentProfile);
router.post("/semester-results", createSemesterResult);
router.get("/semester-results/:userId", getSemesterResults);
router.put(
  "/semester-results/:userId/:semester",
  updateSemesterResult
);
router.get("/documents/:userId", getDocument);
router.put("/documents/:userId", updateDocument);
router.post(
  "/documents",
  upload.single("resume"),
  uploadDocument
);
module.exports = router;