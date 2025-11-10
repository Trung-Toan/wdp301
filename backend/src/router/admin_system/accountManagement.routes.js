const express = require("express");
const router = express.Router();
const accountManagementController = require("../../controller/admin_system/accountManagement.controller");
const dashboardController = require("../../controller/admin_system/dashboard.controller");
const licenseManagementController = require("../../controller/admin_system/licenseManagement.controller");
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

/**
 * @swagger
 * /api/admin-system/dashboard/stats:
 *   get:
 *     tags: [Admin System - Account Management]
 *     summary: Lấy thống kê dashboard
 *     description: ADMIN_SYSTEM xem thống kê tổng quan (người dùng, phòng khám, lịch khám, khiếu nại)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                     charts:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Không phải ADMIN_SYSTEM
 */
router.get("/dashboard/stats", adminSystemAuth, dashboardController.getDashboardStats);

/**
 * @swagger
 * /api/admin-system/licenses:
 *   get:
 *     tags: [Admin System - Account Management]
 *     summary: Lấy danh sách chứng chỉ hành nghề
 *     description: ADMIN_SYSTEM xem danh sách tất cả chứng chỉ hành nghề của bác sĩ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, valid, expiring, expired, pending, rejected]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên bác sĩ hoặc số chứng chỉ
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Không phải ADMIN_SYSTEM
 */
router.get("/licenses", adminSystemAuth, licenseManagementController.getAllLicenses);

/**
 * @swagger
 * /api/admin-system/licenses/{licenseId}:
 *   get:
 *     tags: [Admin System - Account Management]
 *     summary: Lấy chi tiết chứng chỉ hành nghề
 *     description: ADMIN_SYSTEM xem chi tiết chứng chỉ hành nghề
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: licenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của chứng chỉ
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Không phải ADMIN_SYSTEM
 */
router.get("/licenses/:licenseId", adminSystemAuth, licenseManagementController.getLicenseById);

/**
 * @swagger
 * /api/admin-system/licenses/{licenseId}/status:
 *   put:
 *     tags: [Admin System - Account Management]
 *     summary: Cập nhật trạng thái chứng chỉ hành nghề
 *     description: ADMIN_SYSTEM phê duyệt hoặc từ chối chứng chỉ hành nghề
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: licenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của chứng chỉ
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
 *                 enum: [APPROVED, REJECTED]
 *               rejectionReason:
 *                 type: string
 *                 description: Lý do từ chối (nếu status = REJECTED)
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Không phải ADMIN_SYSTEM
 */
router.put("/licenses/:licenseId/status", adminSystemAuth, licenseManagementController.updateLicenseStatus);

module.exports = router;

