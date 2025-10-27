const express = require("express");
const router = express.Router();
const { authRequired, roleRequired } = require("./../../middleware/auth");
const {
  adminclinicController,
} = require("./../../controller/admin_clinic/admin_clinic.controller");

//tạo tài khoản bác sĩ
router.post(
  "/account",
  authRequired,
  roleRequired("ADMIN_CLINIC"),
  adminclinicController.createAccount
);

module.exports = router;
