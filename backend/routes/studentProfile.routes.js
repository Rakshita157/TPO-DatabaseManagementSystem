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

const upload = require("../middleware/upload.middleware");

router.get("/student-profile/:userId", getStudentProfile);
router.post("/student-profile",verifyToken, createStudentProfile);
router.put("/student-profile/:userId", updateStudentProfile);
router.post("/semester-results", createSemesterResult);
router.get("/semester-results/:userId", getSemesterResults);
router.put(
  "/semester-results/:userId/:semester",
  updateSemesterResult
);
router.get("/documents/:userId", getDocument);
router.put("/documents/:userId", upload.single("resume"),updateDocument);
router.post(
  "/documents",
  upload.single("resume"),
  uploadDocument
);
module.exports = router;