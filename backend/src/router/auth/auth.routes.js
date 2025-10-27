const express = require('express');
const router = express.Router();
const ctrl = require('../../controller/auth/auth.controller');
const { authRequired } = require('../../middleware/auth');

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register Patient or Clinic Owner
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, confirmPassword, phone_number, fullName, dob, gender, address]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user123"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password123"
 *               phone_number:
 *                 type: string
 *                 example: "0912345678"
 *               role:
 *                 type: string
 *                 enum: [PATIENT, ADMIN_CLINIC]
 *                 default: PATIENT
 *                 example: "PATIENT"
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               address:
 *                 type: string
 *                 example: "123 Đường ABC"
 *               province_code:
 *                 type: string
 *                 example: "48"
 *               ward_code:
 *                 type: string
 *                 example: "154"
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
 *                 data:
 *                   type: object
 *       '400':
 *         description: Bad Request
 */
router.post('/register', ctrl.registerPatients);

/**
 * @openapi
 * /api/auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, account_id]
 *             properties:
 *               token:
 *                 type: string
 *                 example: abcdef...
 *               account_id:
 *                 type: string
 *                 example: 66f1a2b3c4d5e6f7890a1b2c
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 */
router.post('/verify-email', ctrl.verifyEmail);
router.get('/verify-email', ctrl.verifyEmail);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: kem@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Invalid credentials
 */
router.post('/login', ctrl.login);

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Google
 *     description: Client gửi id_token (JWT của Google) lên server để xác thực.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_token]
 *             properties:
 *               id_token:
 *                 type: string
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Invalid Google token
 */
router.post('/google', ctrl.googleLogin);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh tokens (rotation)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '401':
 *         description: Unauthorized
 */
router.post('/refresh', ctrl.refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (revoke refresh session)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OK
 */
router.post('/logout', ctrl.logout);

/**
 * @openapi
 * /api/auth/request-verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Send verify email again (logged-in required)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *       '401':
 *         description: Unauthorized
 */
router.post('/request-verify-email', authRequired, ctrl.requestVerifyEmail);

/**
 * @openapi
 * /api/auth/request-password-reset:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: kem@example.com
 *     responses:
 *       '200':
 *         description: OK
 */
router.post('/request-password-reset', ctrl.requestPasswordReset);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: NewSecret123
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 */
router.post('/reset-password', ctrl.resetPassword);


router.put('/change-password', authRequired, ctrl.changePassword);

module.exports = router;
