const express = require("express");
const router = express.Router();
const { authRequired, roleRequired } = require("./../../middleware/auth");
const {
  getDoctorsBySpecialty,
} = require("../../controller/doctor/doctorBySpecialty.controller");
const {
  getTopDoctorsController,
  getTopDoctorsNearMeController,
} = require("../../controller/doctor/topDoctor.controller");
const {
  searchDoctorController,
} = require("../../controller/doctor/searchDoctors.controller");
const {
  getDoctorDetailController,
} = require("../../controller/doctor/getDoctorDetail.controller");

// Import controller for doctor
const DoctorController = require("../../controller/doctor/doctor.controler");

/* ========================= PATIENTS ========================= */
// GET /patients?page=1&limit=10&sarch=""
// view list patient of doctor with pagination
//http://localhost:5000/api/doctor/patients
router.get(
  "/patients",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewListPatients
);

// GET /patients/:patientId
// view information patient by patientId
router.get(
  "/patients/:patientId",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewPatientById
);

/* ========================= APPOINTMENTS ========================= */
// GET /appointments?page=1&limit=10&status=""&slot=""&date=""
// view list appointment of doctor with pagination
router.get(
  "/appointments",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewAppointments
);

// GET /appointments/:appointmentId
// view detail appointment by appointmentId
router.get(
  "/appointments/:appointmentId",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewAppointmentDetail
);

/* ========================= MEDICAL RECORD REQUESTS ========================= */
// POST /patients/:patientId/medical-records/request
// request to view medical record of patient
router.post(
  "/patients/:patientId/medical-records/request",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.requestViewMedicalRecord
);

// POST /doctor/patients/:patientId/medical-records/:medicalRecordId/request
router.post(
  "/patients/:patientId/medical-records/:medicalRecordId/request",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.requestViewMedicalRecordById
);
// GET /medical-records/requests/history?page=1
// view history request view medical record pagination
router.get(
  "/medical-records/requests/history",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewHistoryMedicalRecordRequests
);

/* ========================= MEDICAL RECORDS ========================= */
// get /doctor/medical-records?page=1
// view list medical record of all patients of doctor with pagination
router.get(
  "/medical-records",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewListMedicalRecords
);

// GET /patients/:patientId/medical-records?page=1
// view list medical record of patient with pagination
router.get(
  "/patients/:patientId/medical-records",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewListMedicalRecordsByPatient
);

// GET /medical-records/:recordId
// view detail medical record by recordId
router.get(
  "/medical-records/:recordId",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewMedicalRecordDetail
);

// GET /verify/medical-records?page=1&limit=10&status=&search=
router.get(
  "/verify/medical-records",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewListMedicalRecordsVerify
);

// PUT /verify/medical-records/:recordId?status=
// verify medical record
router.put(
  "/verify/medical-records/:recordId",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.verifyMedicalRecord
);

/* ========================= FEEDBACK ========================= */
// GET /feedback?page=1
// view list feedback of doctor with pagination
router.get(
  "/feedback",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewFeedbackList
);

/* ========================= ASSISTANTS ========================= */
// POST /assistants
// create account assistant for doctor
router.post(
  "/assistants",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.createAssistant
);

// PUT /assistants/:assistantId/ban
// ban or unban assistant
router.put(
  "/assistants/:assistantId/ban",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.banOrUnbanAssistant
);

// GET /assistants?page=1
// view list assistant of doctor with pagination
router.get(
  "/assistants",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewListAssistants
);

/* ========================= PROFILE ========================= */
// GET /profile
// view profile of doctor
router.get(
  "/profile",
  authRequired,
  roleRequired("DOCTOR"),
  DoctorController.viewProfile
);

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

// /**
//  * @openapi
//  * /api/doctor/top:
//  *   get:
//  *     tags:
//  *       - Doctor
//  *     summary: Lấy danh sách bác sĩ nổi bật (rating cao nhất)
//  *     description: Trả về các bác sĩ có điểm đánh giá (rating) cao nhất, kèm thông tin phòng khám.
//  *     parameters:
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 5
//  *           minimum: 1
//  *           maximum: 50
//  *         description: Số lượng bác sĩ muốn lấy (mặc định 5)
//  *       - in: query
//  *         name: provinceCode
//  *         schema:
//  *           type: string
//  *           example: "01"
//  *         description: Mã tỉnh/thành để lọc theo địa điểm phòng khám
//  *       - in: query
//  *         name: wardCode
//  *         schema:
//  *           type: string
//  *           example: "00004"
//  *         description: Mã phường/xã để lọc theo địa điểm phòng khám
//  *     responses:
//  *       200:
//  *         description: Danh sách bác sĩ nổi bật
//  */
router.get("/top", getTopDoctorsController);

/**
 * @openapi
 * /api/doctor/top/near-me:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Lấy bác sĩ nổi bật gần vị trí bệnh nhân (dựa trên province/ward đã lưu)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ nổi bật gần tôi
 */
router.get("/top/near-me", authRequired, getTopDoctorsNearMeController);

/**
 * @openapi
 * /api/doctor/search:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Search doctors by name, clinic, specialty (accepts IDs or names)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword (doctor name / clinic name / specialty name / title / degree / workplace)
 *       - in: query
 *         name: clinicId
 *         schema:
 *           type: string
 *         description: Accepts Clinic ObjectId or clinic name
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: string
 *         description: Accepts Specialty ObjectId or specialty name
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

/**
 * @openapi
 * /api/doctor/{id}:
 *   get:
 *     tags:
 *       - Doctor
 *     summary: Get doctor detail (includes clinic, specialties, pricing, and available slots)
 *     description: |
 *       Returns detailed information of a doctor including:
 *       - Basic info (name, degree, title, rating)
 *       - Clinic information
 *       - Specialties
 *       - Pricing range (min–max)
 *       - Upcoming available slots (optionally filtered by date)
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ObjectId
 *
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date to filter slots (default = current time)
 *
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date to limit returned slots (optional)
 *
 *       - in: query
 *         name: limitSlot
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of upcoming slots to return
 *
 *     responses:
 *       200:
 *         description: Successful response with doctor detail and slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "670b7fdc13dbe13e7d558a21"
 *                     name:
 *                       type: string
 *                       example: "Trần Trung Toàn"
 *                     avatar_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://res.cloudinary.com/.../avatar.jpg"
 *                     title:
 *                       type: string
 *                       nullable: true
 *                       example: "BS."
 *                     degree:
 *                       type: string
 *                       nullable: true
 *                       example: "CKI"
 *                     workplace:
 *                       type: string
 *                       nullable: true
 *                       example: "Phòng khám Da liễu Trung ương"
 *                     rating:
 *                       type: number
 *                       example: 4.9
 *                     clinic:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "670b7fdc13dbe13e7d558a11"
 *                         name:
 *                           type: string
 *                           example: "Phòng khám Da liễu Trung ương"
 *                         address:
 *                           type: string
 *                           example: "15A Phan Chu Trinh, Hà Nội"
 *                     specialties:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "670b7fdc13dbe13e7d558a31"
 *                           name:
 *                             type: string
 *                             example: "Da liễu"
 *                           icon_url:
 *                             type: string
 *                             nullable: true
 *                             example: "https://cdn.example.com/icons/derma.svg"
 *                     pricing:
 *                       type: object
 *                       properties:
 *                         minFee:
 *                           type: number
 *                           example: 250000
 *                         maxFee:
 *                           type: number
 *                           example: 500000
 *                         currency:
 *                           type: string
 *                           example: "VND"
 *                     slots:
 *                       type: array
 *                       description: Upcoming available slots
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "670b8a8d3fbd214f14a00cda"
 *                           start_time:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-15T08:00:00.000Z"
 *                           end_time:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-15T09:00:00.000Z"
 *                           fee_amount:
 *                             type: number
 *                             example: 250000
 *                           clinic_name:
 *                             type: string
 *                             example: "Phòng khám Da liễu Trung ương"
 *
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Doctor not found" }
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Unexpected server error" }
 */
router.get("/:id", getDoctorDetailController);

module.exports = router;
