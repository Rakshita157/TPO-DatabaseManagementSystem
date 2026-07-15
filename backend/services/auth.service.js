const prisma = require("../config/prisma");
const { sendOTPEmail } = require("./email.service");
const { generateOTP } = require("../utils/otp");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const sendOTP = async ({ collegeEmail }) => {
  if (!collegeEmail.endsWith("@gweca.ac.in")) {
    throw new Error("Only @gweca.ac.in email addresses are allowed");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      collegeEmail,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

    const otp = generateOTP(); 

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.emailVerification.upsert({
    where: {
      collegeEmail,
    },
    update: {
      otp,
      expiresAt,
      isVerified: false,
    },
    create: {
      collegeEmail,
      otp,
      expiresAt,
    },
  });

  await sendOTPEmail(collegeEmail, otp);

  return {
    message: "OTP sent successfully",
  };
};

const verifyOTP = async ({ collegeEmail, otp }) => {
  const verification = await prisma.emailVerification.findUnique({
    where: {
      collegeEmail,
    },
  });

  if (!verification) {
    throw new Error("Please request a new OTP");
  }

  if (verification.expiresAt < new Date()) {
    throw new Error("OTP has expired");
  }

  if (verification.otp !== otp) {
    throw new Error("Invalid OTP");
  }

await prisma.emailVerification.update({
  where: {
    collegeEmail,
  },
  data: {
    isVerified: true,
    otp: null,
  },
});

  return {
    message: "Email verified successfully",
  };
};


//signup
const signup = async (data) => {
  const { fullName, collegeEmail, password } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      collegeEmail,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }
const verification = await prisma.emailVerification.findUnique({
  where: {
    collegeEmail,
  },
});

if (!verification || !verification.isVerified) {
  throw new Error("Please verify your college email first");
}
if (verification.expiresAt < new Date()) {
  throw new Error("Verification expired. Please verify again.");
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
await prisma.emailVerification.delete({
  where: {
    collegeEmail,
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

  const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

const { password: _, ...userWithoutPassword } = user;

return {
  user: userWithoutPassword,
  token,
};
};




const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const updateUser = async (userId, data) => {
  const { fullName } = data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { fullName },
  });
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  signup,
  login,
  getMe,
  updateUser,
   sendOTP,
  verifyOTP,
};