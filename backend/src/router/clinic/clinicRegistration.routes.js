const express = require("express");
const router = express.Router();
const clinicRegistrationController = require("../../controller/clinic/clinicRegistration.controller");
const authMiddleware = require("../../middleware/auth");

// Middleware xác thực cho admin clinic
const adminClinicAuth = authMiddleware.authenticateAdminClinic;

// Routes cho admin clinic
router.post("/create", adminClinicAuth, clinicRegistrationController.createRegistrationRequest);

// Routes công khai để lấy dữ liệu
router.get("/specialties", clinicRegistrationController.getSpecialties);

module.exports = router;
