const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const { signup, login, getMe, updateUser } = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.put("/user/:userId", updateUser);

module.exports = router;