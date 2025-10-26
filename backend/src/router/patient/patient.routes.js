const express = require("express");
const router = express.Router();
const { authRequired } = require("../../middleware/auth");
const { setLocation } = require("../../controller/patient/patient.controller");

/**
 * @openapi
 * /api/patient/location:
 *   post:
 *     tags:
 *       - Patient
 *     summary: Cập nhật vị trí của bệnh nhân (chỉ cần province_code)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [province_code]
 *             properties:
 *               province_code:
 *                 type: string
 *                 example: "01"
 *                 description: Mã tỉnh/thành phố
 *               ward_code:
 *                 type: string
 *                 example: "00004"
 *                 description: Mã phường/xã (tùy chọn, không bắt buộc)
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.post("/location", authRequired, setLocation);

module.exports = router;


