const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
  }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//required 
const collegeSettingsRoutes = require("./routes/collegeSettings.routes");
const authRoutes = require("./routes/auth.routes");



//routes
app.use("/college-settings", collegeSettingsRoutes);
app.use("/", authRoutes);
module.exports = app;