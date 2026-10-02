const multer = require("multer");
const path = require("path");
const fs = require("fs");

const COORDINATORS_DIR = path.join(__dirname, "..", "uploads", "coordinators");

if (!fs.existsSync(COORDINATORS_DIR)) {
  fs.mkdirSync(COORDINATORS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, COORDINATORS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `coord_${Date.now()}${ext}`);
  },
});

const coordinatorUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"));
    }
  },
});

module.exports = coordinatorUpload;
