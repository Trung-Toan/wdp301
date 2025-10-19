const router = require("express").Router();
const { authRequired } = require("../../middleware/auth");
const ctrl = require("../../controller/user/profile.controller");

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: Quản lý hồ sơ & cài đặt người dùng
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserProfileUpdateRequest:
 *       type: object
 *       properties:
 *         full_name: { type: string, example: "Nguyễn Văn A" }
 *         dob: { type: string, format: date, example: "2000-01-15" }
 *         gender: { type: string, enum: ["MALE","FEMALE","OTHER"] }
 *         address: { type: string, example: "12 Nguyễn Trãi, Q.1, TP.HCM" }
 *         avatar_url: { type: string, example: "https://..." }
 *         email: { type: string, format: email, example: "a@example.com" }
 *         phone: { type: string, example: "0987654321" }
 *     UserSettingsUpdateRequest:
 *       type: object
 *       properties:
 *         notify_upcoming: { type: boolean, example: true }
 *         notify_results: { type: boolean, example: true }
 *         notify_marketing: { type: boolean, example: false }
 *         privacy_allow_doctor_view: { type: boolean, example: true }
 *         privacy_share_with_providers: { type: boolean, example: false }
 */

/**
 * @openapi
 * /api/user/me:
 *   get:
 *     tags: [User]
 *     summary: Lấy thông tin profile của tôi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [User]
 *     summary: Cập nhật thông tin profile của tôi
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authRequired, ctrl.getMyProfile);
router.put("/me", authRequired, ctrl.updateMyProfile);

/**
 * @openapi
 * /api/user/settings:
 *   put:
 *     tags: [User]
 *     summary: Cập nhật cài đặt thông báo và quyền riêng tư
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSettingsUpdateRequest'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Unauthorized
 */
router.put("/settings", authRequired, ctrl.updateSettings);

module.exports = router;
