const express = require("express");
const router = express.Router();
const { authRequired, roleRequired } = require("./../../middleware/auth");

// Import controller for doctor
const AssistanceController = require("../../controller/assistance/assistance.controler");

/* ========================= PATIENTS ========================= */
// GET /patients?page=1
// view list patient of doctor with pagination
router.get("/patients", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewListPatients);

// GET /patients/:patientId
// view information patient by patientId
router.get("/patients/:patientId", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewPatientById);


/* ========================= APPOINTMENTS ========================= */
// GET /appointments?page=1
// view list appointment of doctor with pagination
router.get("/appointments", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewAppointments);

// GET /appointments/:appointmentId 
// view detail appointment by appointmentId
router.get("/appointments/:appointmentId", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewAppointmentDetail);

// PUT /verify/appointments/:appointmentId?status=
// verify appointment
router.put("/verify/appointments/:appointmentId", authRequired, roleRequired("ASSISTANT"), AssistanceController.verifyAppointment);

/* ========================= Slot ========================= */
// GET /slots/doctor
// Get all slot for appointment
router.get("/slots/doctor", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewAppointmentSlot);

// GET /slots/:slotId/doctor
// Get slot by id
router.get("/slots/:slotId/doctor", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewSlotById);

// POST /slots/doctor
// create slot for appointment
router.post("/slots/doctor", authRequired, roleRequired("ASSISTANT"), AssistanceController.createAppointmentSlot);

// PUT /slots/:slotId/doctor
// update slot for appointment
router.put("/slots/:slotId/doctor", authRequired, roleRequired("ASSISTANT"), AssistanceController.updateAppointmentSlot);

/* ========================= MEDICAL RECORDS ========================= */
// GET /patients/:patientId/medical-records?page=1
// view list medical record of patient with pagination
router.get("/patients/:patientId/medical-records", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewListMedicalRecords);

// GET /medical-records/:recordId
// view detail medical record by recordId
router.get("/medical-records/:recordId", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewMedicalRecordDetail);

// PUT /medical-records/:recordId
// update medical record 
router.put("/medical-records/:recordId", authRequired, roleRequired("ASSISTANT"), AssistanceController.updateMedicalRecord);

//POST /medical-records/:recordId
// create medical record
router.post("/medical-records/:recordId", authRequired, roleRequired("ASSISTANT"), AssistanceController.createMedicalRecord);

/* ========================= PROFILE ========================= */
// GET /profile
// view profile of doctor
router.get("/profile", authRequired, roleRequired("ASSISTANT"), AssistanceController.viewProfile);

module.exports = router;
