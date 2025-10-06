const express = require("express");
const { login, profile, register, findUserByEmail, forgetPassword, googleLogin } = require("../controller/AuthenController");
const router = express.Router();
const {verifyToken} = require("./../middleware/authMiddleware")

// view information patient by patientId
router.get("/doctor/view-information-patient-by-id/:patientId", login);
// view information patient by citizenId
router.get("/doctor/view-information-patient-by-citizenId/:citizenId", login);
// view list appointment of doctor with pagination
router.get("/doctor/view-list-appointment", register); // phan trang
// view detail appointment by appointmentId
router.get("/doctor/view-detail-appointment/:appointmentId", findUserByEmail);
// request to view medical record of patient
router.post("/doctor/request-view-mediacal-record/:patientId", forgetPassword);
// view list medical record of patient with pagination
router.get("/doctor/view-list-medical-record/:patientId", forgetPassword); // phan trang
// view detail medical record by recordId
router.get("/doctor/view-detail-medical-record/:recordId", forgetPassword);
// view list feedback of doctor with pagination
router.get("/doctor/view-list-feedback", forgetPassword); // phan trang
// create account assistant for doctor
module.exports = router;