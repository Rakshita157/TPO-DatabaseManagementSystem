const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const {
  signup,
  login,
  getMe,
  updateUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, getMe);

router.put("/user/:userId",verifyToken, updateUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

module.exports = router;