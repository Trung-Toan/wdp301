const express = require("express");
const router = express.Router();
const ctrl = require("../../controller/address/location.controller");

/**
 * @swagger
 * tags:
 *   - name: Locations
 *     description: APIs for province & ward filters
 */

/**
 * @swagger
 * /api/locations/provinces/options:
 *   get:
 *     summary: Get province options for filter
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum: [Miền Bắc, Miền Trung, Miền Nam]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/provinces/options", ctrl.getProvinceOptions);

/**
 * @swagger
 * /api/locations/provinces/{provinceCode}/wards:
 *   get:
 *     summary: Get ward options by provinceCode (cascading filter)
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: provinceCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 500
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/provinces/:provinceCode/wards", ctrl.getWardsByProvince);

module.exports = router;
