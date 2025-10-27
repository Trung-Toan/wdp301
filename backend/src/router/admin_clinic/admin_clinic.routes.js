const express = require("express");
const router = express.Router();
const { authRequired, roleRequired } = require("./../../middleware/auth");
const adminclinicController = require("./../../controller/admin_clinic/admin_clinic.controller");

//tạo tài khoản bác sĩ
router.post(
  "/account",
  authRequired,
  roleRequired("ADMIN_CLINIC"),
  adminclinicController.createAccountDoctor
);

//lấy clinic mà admin clinic hiện tại quản lý
router.get(
  "/get_clinic",
  authRequired,
  roleRequired("ADMIN_CLINIC"),
  adminclinicController.getClinicByAdmin
);

module.exports = router;
