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

//lấy danh sách bác sĩ của clinic mà admin clinic hiện tại quản lý
router.get(
  "/get_doctors",
  authRequired,
  roleRequired("ADMIN_CLINIC"),
  adminclinicController.getDoctorsOfAdminClinic
);

//lấy danh sách trợ lý của clinic mà admin clinic hiện tại quản lý
router.get(
  "/get_assistants",
  authRequired,
  roleRequired("ADMIN_CLINIC"),
  adminclinicController.getAssistants
);

//tạo tài khoản trợ lý cho bác sĩ
router.post(
  "/create_assistant",
  authRequired,
  roleRequired("ADMIN_CLINIC"),
  adminclinicController.createAccountAssistant
);

//xoá trợ lý theo clinic mà admin_clinic đang quản lý
router.delete(
  "/delete_assistant/:id",
  authRequired,
  roleRequired("ADMIN_CLINIC"),
  adminclinicController.deleteAssistant
);

module.exports = router;
