const express = require("express");
const { login, profile, register, findUserByEmail, forgetPassword } = require("../controller/AuthenController");
const router = express.Router();
const {verifyToken} = require("./../middleware/authMiddleware")


router.post("/user/login", login);
router.post("/user/register", register);
router.post("/user/find_email", findUserByEmail);
router.put("/user/forgot_password", forgetPassword);
router.get("/user/profile", verifyToken, profile);

module.exports = router;