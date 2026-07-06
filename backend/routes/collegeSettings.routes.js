const express = require("express");
const router = express.Router();

const {
  getCollegeSettings,
  updateCollegeSettings,
} = require("../controllers/collegeSettings.controller");


router.get("/", getCollegeSettings);
router.put("/", updateCollegeSettings);

module.exports = router;