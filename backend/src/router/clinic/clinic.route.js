const router = require("express").Router();
const { getClinicsByFilters } = require("../../controller/clinic/filterClinic.controller");
const { searchDoctorController } = require("../../controller/doctor/searchDoctors.controller");
const ctrl = require("../../controller/clinic/specialty.controller");

/**
 * @swagger
 * tags:
 *   - name: Clinic
 *     description: Clinic search & listing
 *   - name: Specialties
 *     description: APIs for medical specialties
 */

/**
 * @swagger
 * /api/clinic/specialties:
 *   get:
 *     summary: Get all specialties
 *     tags: [Specialties]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/specialties", ctrl.getAllSpecialties);

/**
 * @swagger
 * /api/clinic/search:
 *   get:
 *     tags: [Clinic]
 *     summary: Tìm bác sĩ theo tỉnh/thành, phường/xã và chuyên khoa
 *     parameters:
 *       - in: query
 *         name: provinceCode
 *         schema: { type: string, example: "01" }
 *       - in: query
 *         name: wardCode
 *         schema: { type: string, example: "00004" }
 *       - in: query
 *         name: specialtyId
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: "-createdAt" }
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ phù hợp (kèm thông tin phòng khám)
 */
router.get("/search", searchDoctorController);

module.exports = router;
