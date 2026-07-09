const {
     signup: signupService ,
    login: loginService,
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


module.exports = {
  signup,
  login,
};