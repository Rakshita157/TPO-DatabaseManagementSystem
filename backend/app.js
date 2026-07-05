const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
  }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//required 
const collegeSettingsRoutes = require("./routes/collegeSettings.routes");
const authRoutes = require("./routes/auth.routes");
const studentProfileRoutes = require("./routes/studentProfile.routes");


//routes
app.use("/college-settings", collegeSettingsRoutes);
app.use("/", authRoutes);
app.use("/", studentProfileRoutes);

module.exports = app;