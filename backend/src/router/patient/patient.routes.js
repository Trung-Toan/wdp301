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
 *     summary: Cập nhật vị trí của bệnh nhân (province_code, ward_code)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [province_code, ward_code]
 *             properties:
 *               province_code:
 *                 type: string
 *                 example: "01"
 *               ward_code:
 *                 type: string
 *                 example: "00004"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.post("/location", authRequired, setLocation);

module.exports = router;


