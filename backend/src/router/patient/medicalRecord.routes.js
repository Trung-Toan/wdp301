const router = require("express").Router();
const { authRequired } = require("../../middleware/auth");
const ctrl = require("../../controller/patient/medicalRecord.controller");

/**
 * @swagger
 * tags:
 *   - name: Medical Records
 *     description: APIs for patient medical records and access requests
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Medicine:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         dosage: { type: string }
 *         frequency: { type: string }
 *         duration: { type: string }
 *         note: { type: string }
 *     Prescription:
 *       type: object
 *       properties:
 *         medicines:
 *           type: array
 *           items: { $ref: '#/components/schemas/Medicine' }
 *         instruction: { type: string }
 *         verified_at: { type: string, format: date-time }
 *         created_by: { type: string, description: Doctor ObjectId }
 *     AccessRequest:
 *       type: object
 *       properties:
 *         doctor_id: { type: string }
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, EXPIRED]
 *         requested_at: { type: string, format: date-time }
 *         approved_at: { type: string, format: date-time, nullable: true }
 *         date_expired: { type: string, format: date-time, nullable: true }
 *     MedicalRecord:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         diagnosis: { type: string }
 *         symptoms:
 *           type: array
 *           items: { type: string }
 *         notes: { type: string }
 *         attachments:
 *           type: array
 *           items: { type: string }
 *         status:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         doctor_id: { type: string }
 *         patient_id: { type: string }
 *         access_requests:
 *           type: array
 *           items: { $ref: '#/components/schemas/AccessRequest' }
 *         prescription: { $ref: '#/components/schemas/Prescription' }
 */

// List my medical records (optionally by patientId)
/**
 * @swagger
 * /api/patient/records:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Medical Records]
 *     summary: Danh sách hồ sơ bệnh án của tôi
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/MedicalRecord' }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 */
router.get("/records", authRequired, ctrl.listMyRecords);

/**
 * @swagger
 * /api/patient/records/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Medical Records]
 *     summary: Chi tiết hồ sơ bệnh án
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/MedicalRecord' }
 */
router.get("/records/:id", authRequired, ctrl.getRecordDetail);

// /**
//  * @swagger
//  * /api/patient/records/{id}/access:
//  *   post:
//  *     security:
//  *       - bearerAuth: []
//  *     tags: [Medical Records]
//  *     summary: Tạo yêu cầu truy cập hồ sơ bệnh án (bác sĩ yêu cầu)
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema: { type: string }
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [doctor_id]
//  *             properties:
//  *               doctor_id: { type: string }
//  *     responses:
//  *       200:
//  *         description: OK
//  */
// router.post("/records/:id/access", authRequired, ctrl.requestAccess);

/**
 * @swagger
 * /api/patient/records/{id}/access/{requestId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Medical Records]
 *     summary: Cập nhật trạng thái yêu cầu truy cập (APPROVE/REJECT)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [APPROVE, REJECT]
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/records/:id/access/:requestId", authRequired, ctrl.updateAccessRequest);

module.exports = router;


