const {
  signup: signupService,
  login: loginService,
  getMe: getMeService,
  updateUser: updateUserService,
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

module.exports = {
  signup,
  login,
  getMe,
  updateUser,
};