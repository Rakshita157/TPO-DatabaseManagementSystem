const express = require("express");
const router = express.Router();
const { getStudentCoordinators } = require("../controllers/coordinator.controller");

router.get("/", getStudentCoordinators);

module.exports = router;
