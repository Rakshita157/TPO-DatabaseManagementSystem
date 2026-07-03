const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const collegeSettingsRoutes = require("./routes/collegeSettings.routes");

//routes
app.use("/college-settings", collegeSettingsRoutes);

module.exports = app;