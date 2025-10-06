const express = require("express");
const router = express.Router();
const { verifyToken } = require("./../middleware/authMiddleware");

// Import controller (gợi ý tách riêng DoctorController)
const DoctorController = require("../controller/DoctorController");

/* ========================= PATIENTS ========================= */
// GET /doctor/patients?page=1
// view list patient of doctor with pagination
router.get("/doctor/patients", verifyToken, DoctorController.viewListPatients);

// GET /doctor/patients/:patientId
// view information patient by patientId
router.get("/doctor/patients/:patientId", verifyToken, DoctorController.viewPatientById);

// GET /doctor/patients/citizen/:citizenId
// view information patient by citizenId
router.get("/doctor/patients/citizen/:citizenId", verifyToken, DoctorController.viewPatientByCitizenId);

/* ========================= APPOINTMENTS ========================= */
// GET /doctor/appointments?page=1
// view list appointment of doctor with pagination
router.get("/doctor/appointments", verifyToken, DoctorController.viewAppointments);

// GET /doctor/appointments/:appointmentId
// view detail appointment by appointmentId
router.get("/doctor/appointments/:appointmentId", verifyToken, DoctorController.viewAppointmentDetail);

/* ========================= MEDICAL RECORD REQUESTS ========================= */
// POST /doctor/patients/:patientId/medical-records/request
// request to view medical record of patient
router.post("/doctor/patients/:patientId/medical-records/request", verifyToken, DoctorController.requestViewMedicalRecord);

// GET /doctor/medical-records/requests/history?page=1
// view history request view medical record pagination
router.get("/doctor/medical-records/requests/history", verifyToken, DoctorController.viewHistoryMedicalRecordRequests);

/* ========================= MEDICAL RECORDS ========================= */
// GET /doctor/patients/:patientId/medical-records?page=1
// view list medical record of patient with pagination
router.get("/doctor/patients/:patientId/medical-records", verifyToken, DoctorController.viewListMedicalRecords);

// GET /doctor/medical-records/:recordId
// view detail medical record by recordId
router.get("/doctor/medical-records/:recordId", verifyToken, DoctorController.viewMedicalRecordDetail);

// PUT /doctor/medical-records/:recordId/verify
// verify medical record 
router.put("/doctor/medical-records/:recordId/verify", verifyToken, DoctorController.verifyMedicalRecord);

/* ========================= FEEDBACK ========================= */
// GET /doctor/feedback?page=1
// view list feedback of doctor with pagination
router.get("/doctor/feedback", verifyToken, DoctorController.viewFeedbackList);

/* ========================= ASSISTANTS ========================= */
// POST /doctor/assistants
// create account assistant for doctor
router.post("/doctor/assistants", verifyToken, DoctorController.createAssistant);

// PUT /doctor/assistants/:assistantId/ban
// ban or unban assistant
router.put("/doctor/assistants/:assistantId/ban", verifyToken, DoctorController.banOrUnbanAssistant);

// GET /doctor/assistants?page=1
// view list assistant of doctor with pagination
router.get("/doctor/assistants", verifyToken, DoctorController.viewListAssistants);

/* ========================= PROFILE ========================= */
// GET /doctor/profile
// view profile of doctor
router.get("/doctor/profile", verifyToken, DoctorController.viewProfile);

module.exports = router;
