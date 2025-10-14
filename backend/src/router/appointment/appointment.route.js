const express = require("express");
const router = express.Router();
const ctrl = require("../../controller/appoinment/appointment.controller");
const validateObjectId = require("../../middleware/validateObjectId");

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Đặt lịch khám theo slot
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentCreateRequest:
 *       type: object
 *       required: [slot_id, doctor_id, patient_id, specialty_id, full_name, phone, email]
 *       properties:
 *         slot_id:       { type: string, example: "670d2f5f7f9f1b2c3d4e5f60" }
 *         doctor_id:     { type: string, example: "670d2a1f7f9f1b2c3d4e5a12" }
 *         patient_id:    { type: string, example: "670d2c4a7f9f1b2c3d4e5b34" }
 *         specialty_id:  { type: string, example: "670d299e7f9f1b2c3d4e59ff" }
 *         clinic_id:     { type: string, example: "670d29117f9f1b2c3d4e5901" }
 *         full_name:     { type: string, example: "Nguyễn Nam Phong" }
 *         phone:         { type: string, example: "0985843234" }
 *         email:         { type: string, example: "exam@gmail.com" }
 *         dob:           { type: string, format: date, example: "1998-02-20" }
 *         gender:        { type: string, enum: [MALE, FEMALE, OTHER], example: "MALE" }
 *         province_code: { type: string, example: "01" }
 *         ward_code:     { type: string, example: "00235" }
 *         address_text:  { type: string, example: "Số 10, ngõ 1, Đống Đa" }
 *         reason:        { type: string, example: "Đau đầu, mỏi mắt" }
 *
 *     DoctorLite:
 *       type: object
 *       properties:
 *         title:      { type: string, example: "BS." }
 *         degree:     { type: string, example: "ThS." }
 *         avatar_url: { type: string, example: "https://..." }
 *         user_id:
 *           type: object
 *           properties:
 *             full_name: { type: string, example: "Nguyễn Văn An" }
 *
 *     ClinicLite:
 *       type: object
 *       properties:
 *         name:    { type: string, example: "Bệnh viện Đa khoa TW" }
 *         address: { type: string, example: "78 Giải Phóng, Hà Nội" }
 *
 *     SpecialtyLite:
 *       type: object
 *       properties:
 *         name: { type: string, example: "Tim mạch" }
 *
 *     AppointmentCore:
 *       type: object
 *       properties:
 *         _id:            { type: string, example: "671011111111111111111111" }
 *         booking_code:   { type: string, example: "BK123456" }
 *         status:         { type: string, example: "SCHEDULED" }
 *         scheduled_date: { type: string, format: date-time, example: "2025-10-20T00:00:00.000Z" }
 *         fee_amount:     { type: number, example: 500000 }
 *
 *     SuccessAppointmentCreate:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         data:
 *           allOf:
 *             - $ref: '#/components/schemas/AppointmentCore'
 *           properties:
 *             doctor_id:    { $ref: '#/components/schemas/DoctorLite' }
 *             clinic_id:    { $ref: '#/components/schemas/ClinicLite' }
 *             specialty_id: { $ref: '#/components/schemas/SpecialtyLite' }
 *             email_sent:   { type: boolean, example: true }
 *             email_error:  { type: string, nullable: true, example: null }
 *
 *     SuccessAppointmentDetail:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         data:
 *           allOf:
 *             - $ref: '#/components/schemas/AppointmentCore'
 *           properties:
 *             doctor_id:    { $ref: '#/components/schemas/DoctorLite' }
 *             clinic_id:    { $ref: '#/components/schemas/ClinicLite' }
 *             specialty_id: { $ref: '#/components/schemas/SpecialtyLite' }
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         error:   { type: string, example: "Slot is full" }
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Tạo lịch khám (đặt lịch)
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AppointmentCreateRequest' }
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessAppointmentCreate' }
 *       400:
 *         description: Lỗi dữ liệu (slot full/unavailable/not found, patient not found)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Trùng đặt lịch cho cùng slot
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/", ctrl.create);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Lấy chi tiết lịch khám
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Appointment ID (Mongo ObjectId)
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessAppointmentDetail' }
 *       404:
 *         description: Không tìm thấy
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id", ctrl.getById);

/**
 * @swagger
 * /api/appointments/patient/{patientId}:
 *   get:
 *     summary: Danh sách lịch đã đặt của 1 bệnh nhân (tối giản)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: string, example: "67144f55cf4c1a122eb89e1a" }
 *         description: MongoDB ObjectId của bệnh nhân
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, COMPLETED, CANCELLED, NO_SHOW]
 *         description: Lọc theo trạng thái (tuỳ chọn)
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: Danh sách appointment (tối giản) có phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 2 }
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 10 }
 *                     totalPages: { type: integer, example: 1 }
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:            { type: string, example: "671c1b87c4b1c0a2a4d8f27e" }
 *                           status:         { type: string, enum: [SCHEDULED, COMPLETED, CANCELLED, NO_SHOW], example: "SCHEDULED" }
 *                           booked_at:      { type: string, format: date-time, example: "2025-10-13T08:32:00.000Z" }
 *                           scheduled_date: { type: string, format: date-time, example: "2025-10-20T00:00:00.000Z" }
 *                           fee_amount:     { type: number, example: 300000 }
 *                           booking_code:   { type: string, example: "BK123456" }
 *                           slot_id:
 *                             type: object
 *                             properties:
 *                               _id:        { type: string, example: "671c1b87c4b1c0a2a4d8f200" }
 *                               start_time: { type: string, format: date-time, example: "2025-10-20T08:00:00.000Z" }
 *                               end_time:   { type: string, format: date-time, example: "2025-10-20T08:30:00.000Z" }
 *       500:
 *         description: Lỗi server
 */
router.get("/patient/:patientId", validateObjectId("patientId"), ctrl.getByPatient);

module.exports = router;