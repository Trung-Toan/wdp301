const express = require("express");
const router = express.Router();
const { authRequired, roleRequired } = require("./../../middleware/auth");
const { getDoctorsBySpecialty } = require("../../controller/doctor/doctorBySpecialty.controller");
const { getTopDoctorsController } = require("../../controller/doctor/topDoctor.controller");
const { searchDoctorController } = require("../../controller/doctor/searchDoctors.controller");;

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

// POST /doctor/patients/:patientId/medical-records/:medicalRecordId/request
router.post("/patients/:patientId/medical-records/:medicalRecordId/request", authRequired, roleRequired("DOCTOR"), DoctorController.requestViewMedicalRecordById);
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



/**
 * @openapi
 * /api/doctor/by-specialty:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Lấy bác sĩ theo chuyên khoa (kèm tên & địa chỉ phòng khám)
 *     parameters:
 *       - in: query
 *         name: specialtyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/by-specialty", getDoctorsBySpecialty);


/**
 * @openapi
 * /api/doctor/top:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Lấy danh sách bác sĩ nổi bật (rating cao nhất)
 *     description: Trả về các bác sĩ có điểm đánh giá (rating) cao nhất, kèm thông tin phòng khám.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 50
 *         description: Số lượng bác sĩ muốn lấy (mặc định 5)
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ nổi bật
 */
router.get("/top", getTopDoctorsController);

/**
 * @openapi
 * /api/doctor/search:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Search doctors by name, clinic, specialty
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: clinicId
 *         schema:
 *           type: string
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, rating, -rating, full_name, -full_name]
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/search", searchDoctorController);


module.exports = router;
