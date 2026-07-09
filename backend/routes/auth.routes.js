const express = require("express");
const router = express.Router();


const { signup , login, updateUser } = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.put("/user/:userId", updateUser);

module.exports = router;