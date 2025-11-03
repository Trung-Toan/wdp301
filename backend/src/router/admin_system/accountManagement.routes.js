const express = require("express");
const router = express.Router();
const accountManagementController = require("../../controller/admin_system/accountManagement.controller");
const authMiddleware = require("../../middleware/auth");

// Middleware xác thực cho admin system
const adminSystemAuth = authMiddleware.authenticateAdminSystem;

/**
 * @swagger
 * tags:
 *   - name: Admin System - Account Management
 *     description: API quản lý tài khoản ADMIN_CLINIC (chỉ ADMIN_SYSTEM)
 */

/**
 * @swagger
 * /api/admin-system/accounts:
 *   get:
 *     tags: [Admin System - Account Management]
 *     summary: Lấy danh sách ADMIN_CLINIC với filter
 *     description: ADMIN_SYSTEM xem danh sách tất cả tài khoản ADMIN_CLINIC
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, PENDING, ACTIVE, SUSPENDED, REJECTED]
 *         description: Lọc theo trạng thái (all = tất cả)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo username hoặc email
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
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Không phải ADMIN_SYSTEM
 */
router.get("/accounts", adminSystemAuth, accountManagementController.getAdminClinicAccounts);

/**
 * @swagger
 * /api/admin-system/accounts/pending:
 *   get:
 *     tags: [Admin System - Account Management]
 *     summary: Lấy danh sách ADMIN_CLINIC đang chờ phê duyệt
 *     description: ADMIN_SYSTEM xem danh sách tài khoản ADMIN_CLINIC có status = PENDING
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/accounts/pending", adminSystemAuth, accountManagementController.getPendingAdminClinicAccounts);

/**
 * @swagger
 * /api/admin-system/accounts/{accountId}/approve:
 *   put:
 *     tags: [Admin System - Account Management]
 *     summary: Phê duyệt ADMIN_CLINIC
 *     description: ADMIN_SYSTEM phê duyệt tài khoản ADMIN_CLINIC (PENDING -> ACTIVE)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID của ADMIN_CLINIC
 *     responses:
 *       200:
 *         description: Phê duyệt thành công
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/accounts/:accountId/approve", adminSystemAuth, accountManagementController.approveAdminClinic);

/**
 * @swagger
 * /api/admin-system/accounts/{accountId}/reject:
 *   put:
 *     tags: [Admin System - Account Management]
 *     summary: Từ chối ADMIN_CLINIC
 *     description: ADMIN_SYSTEM từ chối tài khoản ADMIN_CLINIC (PENDING -> REJECTED)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 example: "Thiếu giấy tờ hợp lệ"
 *     responses:
 *       200:
 *         description: Từ chối thành công
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/accounts/:accountId/reject", adminSystemAuth, accountManagementController.rejectAdminClinic);

/**
 * @swagger
 * /api/admin-system/accounts/{accountId}/ban:
 *   put:
 *     tags: [Admin System - Account Management]
 *     summary: Cấm ADMIN_CLINIC
 *     description: ADMIN_SYSTEM cấm tài khoản ADMIN_CLINIC (chuyển status -> SUSPENDED)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cấm thành công
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/accounts/:accountId/ban", adminSystemAuth, accountManagementController.banAdminClinic);

/**
 * @swagger
 * /api/admin-system/accounts/{accountId}/unban:
 *   put:
 *     tags: [Admin System - Account Management]
 *     summary: Gỡ cấm ADMIN_CLINIC
 *     description: ADMIN_SYSTEM gỡ cấm tài khoản ADMIN_CLINIC (SUSPENDED -> ACTIVE)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gỡ cấm thành công
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/accounts/:accountId/unban", adminSystemAuth, accountManagementController.unbanAdminClinic);

/**
 * @swagger
 * /api/admin-system/accounts/{accountId}:
 *   get:
 *     tags: [Admin System - Account Management]
 *     summary: Lấy chi tiết ADMIN_CLINIC
 *     description: ADMIN_SYSTEM xem chi tiết tài khoản ADMIN_CLINIC
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
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
router.get("/accounts/:accountId", adminSystemAuth, accountManagementController.getAdminClinicDetail);

module.exports = router;

