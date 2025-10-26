const express = require("express");
const router = express.Router();
const clinicRegistrationController = require("../../controller/clinic/clinicRegistration.controller");
const authMiddleware = require("../../middleware/auth");

// Middleware xác thực cho admin clinic
const adminClinicAuth = authMiddleware.authenticateAdminClinic;

/**
 * @swagger
 * tags:
 *   - name: Clinic Registration
 *     description: API đăng ký phòng khám cho admin clinic
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ClinicInfo:
 *       type: object
 *       required: [name, registration_number, opening_hours, closing_hours, address, specialties]
 *       properties:
 *         name:
 *           type: string
 *           example: "Phòng khám Đa khoa ABC"
 *         phone:
 *           type: string
 *           example: "0123456789"
 *         email:
 *           type: string
 *           format: email
 *           example: "contact@phongkhambc.com"
 *         website:
 *           type: string
 *           example: "https://phongkhambc.com"
 *         description:
 *           type: string
 *           example: "Phòng khám chuyên về tim mạch và nội tiết"
 *         logo_url:
 *           type: string
 *           example: "https://example.com/logo.jpg"
 *         banner_url:
 *           type: string
 *           example: "https://example.com/banner.jpg"
 *         registration_number:
 *           type: string
 *           example: "PK2024001"
 *         opening_hours:
 *           type: string
 *           example: "08:00"
 *         closing_hours:
 *           type: string
 *           example: "17:00"
 *         address:
 *           type: object
 *           properties:
 *             province:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "01"
 *                 name:
 *                   type: string
 *                   example: "Hà Nội"
 *             ward:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00001"
 *                 name:
 *                   type: string
 *                   example: "Phường Cửa Đông"
 *             houseNumber:
 *               type: string
 *               example: "123"
 *             street:
 *               type: string
 *               example: "Phố Huế"
 *             alley:
 *               type: string
 *               example: "Ngõ 5"
 *         specialties:
 *           type: array
 *           items:
 *             type: string
 *           example: ["6601234567890abcdef12345", "6601234567890abcdef12346"]
 *
 *     Clinic:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "670d299e7f9f1b2c3d4e59ff"
 *         name:
 *           type: string
 *           example: "Phòng khám Đa khoa ABC"
 *         phone:
 *           type: string
 *           example: "0123456789"
 *         email:
 *           type: string
 *           example: "contact@phongkhambc.com"
 *         registration_number:
 *           type: string
 *           example: "PK2024001"
 *         opening_hours:
 *           type: string
 *           example: "08:00"
 *         closing_hours:
 *           type: string
 *           example: "17:00"
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, INACTIVE, REJECTED]
 *           example: "PENDING"
 *         address:
 *           type: object
 *         specialties:
 *           type: array
 *           items:
 *             type: string
 *         created_by:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Specialty:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Tạo yêu cầu đăng ký thành công"
 *         data:
 *           $ref: '#/components/schemas/Clinic'
 */

/**
 * @swagger
 * /api/clinic-registration/create:
 *   post:
 *     tags: [Clinic Registration]
 *     summary: Tạo yêu cầu đăng ký phòng khám
 *     description: Admin Clinic gửi yêu cầu đăng ký phòng khám để chờ hệ thống phê duyệt
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clinic_info]
 *             properties:
 *               clinic_info:
 *                 $ref: '#/components/schemas/ClinicInfo'
 *     responses:
 *       200:
 *         description: Tạo yêu cầu đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Lỗi dữ liệu hoặc đã có yêu cầu đang chờ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Bạn đã có yêu cầu đang chờ phê duyệt"
 *       401:
 *         description: Unauthorized - Token không hợp lệ
 */
router.post("/create", adminClinicAuth, clinicRegistrationController.createRegistrationRequest);

/**
 * @swagger
 * /api/clinic-registration/specialties:
 *   get:
 *     tags: [Clinic Registration]
 *     summary: Lấy danh sách chuyên khoa
 *     description: Lấy danh sách tất cả chuyên khoa có trong hệ thống (public API)
 *     security: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy danh sách chuyên khoa thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Specialty'
 */
router.get("/specialties", clinicRegistrationController.getSpecialties);

module.exports = router;
