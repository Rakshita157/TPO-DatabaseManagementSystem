const {
  signup: signupService,
  login: loginService,
  sendOTP: sendOTPService,
  verifyOTP: verifyOTPService,
  getMe: getMeService,
  updateUser: updateUserService,
  forgotPasswordService,
  verifyResetOTPService,
  resetPasswordService,
} = require("../services/auth.service");

//Signup 
const signup = async (req, res) => {
  try {
    const user = await signupService(req.body);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

//login
const login = async (req, res) => {
  try {
     const {user,token} = await loginService(req.body);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });

  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const sendOTP = async (req, res) => {
  try {
    const result = await sendOTPService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const result = await verifyOTPService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}; 

const getMe = async (req, res) => {
  try {
    const user = await getMeService(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token or user not found" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await updateUserService(Number(userId), req.body);
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const result = await forgotPasswordService(req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const verifyResetOTP = async (req, res) => {
  try {
    const result = await verifyResetOTPService(req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await resetPasswordService(req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  login,

  sendOTP,
  verifyOTP,

  getMe,
  updateUser,

  forgotPassword,
  verifyResetOTP,
  resetPassword,
};