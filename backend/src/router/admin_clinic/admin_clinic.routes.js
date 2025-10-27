const express = require("express");
const router = express.Router();
const { authRequired, roleRequired } = require("./../../middleware/auth");

//tạo tài khoản bác sĩ
router.post(
  "/account",
  authRequired,
  roleRequired("ADMIN_CLINIC"),
  require("./../../controller/admin-clinic/admin-clinic.controller")
    .createAccount
);
module.exports = router;
