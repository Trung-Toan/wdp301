const express = require("express");
const router = express.Router();
const complaintManagementController = require("../../controller/admin_system/complaintManagement.controller");
const authMiddleware = require("../../middleware/auth");

// Middleware xác thực cho admin system
const adminSystemAuth = authMiddleware.authenticateAdminSystem;

/**
 * @swagger
 * tags:
 *   - name: Admin System - Complaint Management
 *     description: API quản lý khiếu nại (chỉ ADMIN_SYSTEM)
 */

/**
 * @swagger
 * /api/admin-system/complaints:
 *   get:
 *     tags: [Admin System - Complaint Management]
 *     summary: Lấy danh sách tất cả khiếu nại
 *     description: ADMIN_SYSTEM xem danh sách tất cả khiếu nại về bác sĩ và phòng khám
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_REVIEW, RESOLVED, DISMISSED]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: complaint_type
 *         schema:
 *           type: string
 *           enum: [DOCTOR, CLINIC]
 *         description: Lọc theo loại khiếu nại (DOCTOR hoặc CLINIC)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề hoặc nội dung
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Không phải ADMIN_SYSTEM
 */
router.get("/complaints", adminSystemAuth, complaintManagementController.getAllComplaints);

/**
 * @swagger
 * /api/admin-system/complaints/stats:
 *   get:
 *     tags: [Admin System - Complaint Management]
 *     summary: Lấy thống kê khiếu nại
 *     description: ADMIN_SYSTEM xem thống kê khiếu nại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/complaints/stats", adminSystemAuth, complaintManagementController.getComplaintStats);

/**
 * @swagger
 * /api/admin-system/complaints/{complaintId}:
 *   get:
 *     tags: [Admin System - Complaint Management]
 *     summary: Lấy chi tiết khiếu nại
 *     description: ADMIN_SYSTEM xem chi tiết khiếu nại
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khiếu nại
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/complaints/:complaintId", adminSystemAuth, complaintManagementController.getComplaintById);

/**
 * @swagger
 * /api/admin-system/complaints/{complaintId}/status:
 *   put:
 *     tags: [Admin System - Complaint Management]
 *     summary: Cập nhật trạng thái khiếu nại
 *     description: ADMIN_SYSTEM cập nhật trạng thái khiếu nại (PENDING, IN_REVIEW, RESOLVED, DISMISSED)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khiếu nại
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_REVIEW, RESOLVED, DISMISSED]
 *                 example: "RESOLVED"
 *               resolutionNote:
 *                 type: string
 *                 description: Ghi chú giải quyết (bắt buộc nếu status = RESOLVED)
 *                 example: "Đã xử lý xong khiếu nại"
 *               dismissedReason:
 *                 type: string
 *                 description: Lý do từ chối (bắt buộc nếu status = DISMISSED)
 *                 example: "Khiếu nại không có cơ sở"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/complaints/:complaintId/status", adminSystemAuth, complaintManagementController.updateComplaintStatus);

module.exports = router;

