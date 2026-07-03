const express = require("express");
const router = express.Router();

const {
  getCollegeSettings,
} = require("../controllers/collegeSettings.controller");


router.get("/", getCollegeSettings);
module.exports = router;