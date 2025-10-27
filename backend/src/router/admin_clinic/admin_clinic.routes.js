const express = require("express");
const router = express.Router();
const { authRequired, roleRequired } = require("./../../middleware/auth");

//tạo tài khoản bác sĩ
router.get("/", authRequired, roleRequired("ADMIN_CLINIC"), (req, res) => {
  res.send("Tạo tài khoản bác sĩ");
});
