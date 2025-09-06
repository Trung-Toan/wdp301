const express = require("express");
const { login, profile, register } = require("../controller/AuthenController");
const router = express.Router();
const {verifyToken} = require("./../middleware/authMiddleware")


router.post("/user/login", login);
router.post("/user/register", register);
router.get("/user/profile", verifyToken, profile);

module.exports = router;