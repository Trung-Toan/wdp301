const express = require("express");
const router = express.Router();
const ctrl = require("../../controller/clinic/specialty.controller");

/**
 * @swagger
 * tags:
 *   - name: Specialties
 *     description: APIs for medical specialties
 */

/**
 * @swagger
 * /api/clinic/specialties:
 *   get:
 *     summary: Get all specialties
 *     tags: [Specialties]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by status
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by name or description
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 2
 *               data:
 *                 - name: "Nội tổng quát"
 *                   description: "Chẩn đoán và điều trị tổng quát"
 *                   icon_url: "https://cdn.example.com/icons/general.png"
 *                   status: "ACTIVE"
 *                 - name: "Nhi khoa"
 *                   description: "Khám và điều trị cho trẻ em"
 *                   icon_url: "https://cdn.example.com/icons/pediatrics.png"
 *                   status: "ACTIVE"
 */
router.get("/specialties", ctrl.getAllSpecialties);

module.exports = router;
