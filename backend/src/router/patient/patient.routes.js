const express = require("express");
const router = express.Router();
const { authRequired } = require("../../middleware/auth");
const { setLocation } = require("../../controller/patient/patient.controller");
const {
    createFeedback,
    getFeedbacksByDoctorId,
    getDoctorRating,
    deleteFeedback
} = require("../../controller/patient/feedback.controller");

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

/**
 * @openapi
 * /api/patient/feedback:
 *   post:
 *     tags:
 *       - Patient
 *     summary: Tạo feedback/đánh giá cho bác sĩ
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, rating, comment]
 *             properties:
 *               doctorId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: ID của bác sĩ
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Đánh giá từ 1-5 sao
 *               comment:
 *                 type: string
 *                 example: "Bác sĩ rất tận tâm và chuyên nghiệp"
 *                 description: Nhận xét về bác sĩ
 *               isAnonymous:
 *                 type: boolean
 *                 example: false
 *                 description: Đánh giá ẩn danh (tùy chọn)
 *     responses:
 *       201:
 *         description: Tạo feedback thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy patient hoặc doctor
 */
router.post("/feedback", authRequired, createFeedback);

/**
 * @openapi
 * /api/patient/feedback/doctor/{doctorId}:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Lấy danh sách feedback của một bác sĩ
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bác sĩ
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
 *         description: Số lượng feedback mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách feedback
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.get("/feedback/doctor/:doctorId", getFeedbacksByDoctorId);

/**
 * @openapi
 * /api/patient/feedback/doctor/{doctorId}/rating:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Lấy rating trung bình và tổng số feedback của bác sĩ
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bác sĩ
 *     responses:
 *       200:
 *         description: Thông tin rating
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.get("/feedback/doctor/:doctorId/rating", getDoctorRating);

/**
 * @openapi
 * /api/patient/feedback/{feedbackId}:
 *   delete:
 *     tags:
 *       - Patient
 *     summary: Xóa feedback (chỉ cho phép xóa feedback của chính mình)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của feedback
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy feedback hoặc không có quyền xóa
 */
router.delete("/feedback/:feedbackId", authRequired, deleteFeedback);

module.exports = router;


