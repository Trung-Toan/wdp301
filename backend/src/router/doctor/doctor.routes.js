const express = require("express");
const router = express.Router();
const { authRequired, roleRequired } = require("./../../middleware/auth");

// Import controller for doctor
const DoctorController = require("../../controller/doctor/doctor.controler");

/* ========================= PATIENTS ========================= */
// GET /patients?page=1
// view list patient of doctor with pagination
router.get("/patients", authRequired, roleRequired("DOCTOR"), DoctorController.viewListPatients);

// GET /patients/:patientId
// view information patient by patientId
router.get("/patients/:patientId", authRequired, roleRequired("DOCTOR"), DoctorController.viewPatientById);

// GET /patients/code/:patientCode
// view information patient by code patient
router.get("/patients/code/:patientCode", authRequired, roleRequired("DOCTOR"), DoctorController.viewPatientByCode);

/* ========================= APPOINTMENTS ========================= */
// GET /appointments?page=1
// view list appointment of doctor with pagination
router.get("/appointments", authRequired, roleRequired("DOCTOR"), DoctorController.viewAppointments);

// GET /appointments/status/:status?page=1
// view list appointment of doctor by status with pagination
router.get("/appointments/status/:status", authRequired, roleRequired("DOCTOR"), DoctorController.viewAppointmentsByStatus);

// GET /appointments/:appointmentId
// view detail appointment by appointmentId
router.get("/appointments/:appointmentId", authRequired, roleRequired("DOCTOR"), DoctorController.viewAppointmentDetail);

/* ========================= MEDICAL RECORD REQUESTS ========================= */
// POST /patients/:patientId/medical-records/request
// request to view medical record of patient
router.post("/patients/:patientId/medical-records/request", authRequired, roleRequired("DOCTOR"), DoctorController.requestViewMedicalRecord);

// GET /medical-records/requests/history?page=1
// view history request view medical record pagination
router.get("/medical-records/requests/history", authRequired, roleRequired("DOCTOR"), DoctorController.viewHistoryMedicalRecordRequests);

/* ========================= MEDICAL RECORDS ========================= */
// GET /patients/:patientId/medical-records?page=1
// view list medical record of patient with pagination
router.get("/patients/:patientId/medical-records", authRequired, roleRequired("DOCTOR"), DoctorController.viewListMedicalRecords);

// GET /medical-records/:recordId
// view detail medical record by recordId
router.get("/medical-records/:recordId", authRequired, roleRequired("DOCTOR"), DoctorController.viewMedicalRecordDetail);

// PUT /medical-records/:recordId/verify
// verify medical record 
router.put("/medical-records/:recordId/verify", authRequired, roleRequired("DOCTOR"), DoctorController.verifyMedicalRecord);

/* ========================= FEEDBACK ========================= */
// GET /feedback?page=1
// view list feedback of doctor with pagination
router.get("/feedback", authRequired, roleRequired("DOCTOR"), DoctorController.viewFeedbackList);

/* ========================= ASSISTANTS ========================= */
// POST /assistants
// create account assistant for doctor
router.post("/assistants", authRequired, roleRequired("DOCTOR"), DoctorController.createAssistant);

// PUT /assistants/:assistantId/ban
// ban or unban assistant
router.put("/assistants/:assistantId/ban", authRequired, roleRequired("DOCTOR"), DoctorController.banOrUnbanAssistant);

// GET /assistants?page=1
// view list assistant of doctor with pagination
router.get("/assistants", authRequired, roleRequired("DOCTOR"), DoctorController.viewListAssistants);

/* ========================= PROFILE ========================= */
// GET /profile
// view profile of doctor
router.get("/profile", authRequired, roleRequired("DOCTOR"), DoctorController.viewProfile);

module.exports = router;
