const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

//signup
const signup = async (data) => {
  const { fullName,collegeEmail, password } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      collegeEmail,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      fullName,
      collegeEmail,
      password: hashedPassword,
    },
  });

  return user;
};

//login
const login = async (data) => {
  const { collegeEmail, password } = data;

  const user = await prisma.user.findUnique({
    where: {
      collegeEmail,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};




module.exports = {
  signup,
  login
};