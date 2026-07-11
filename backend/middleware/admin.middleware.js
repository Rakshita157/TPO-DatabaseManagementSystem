const verifyToken = require("./auth.middleware");

const requireAdmin = [
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  },
];

module.exports = requireAdmin;
