const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

//signup
const signup = async (data) => {
  const { fullName, collegeEmail, password } = data;

  if (!collegeEmail.endsWith('@gweca.ac.in')) {
    throw new Error('Only @gweca.ac.in email addresses are allowed');
  }

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

// Remove password before returning
const { password: _, ...userWithoutPassword } = user;

return userWithoutPassword;

  // return user;
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

const { password: _, ...userWithoutPassword } = user;

return userWithoutPassword;
};




module.exports = {
  signup,
  login
};