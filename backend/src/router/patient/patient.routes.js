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
const complaintController = require("../../controller/patient/complaint.controller");
const relativeController = require("../../controller/patient/relative.controller");

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

/**
 * @openapi
 * /api/patient/complaints:
 *   post:
 *     tags:
 *       - Patient
 *     summary: Tạo khiếu nại về bác sĩ hoặc phòng khám
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, complaint_type]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Khiếu nại về thái độ phục vụ"
 *                 description: Tiêu đề khiếu nại
 *               content:
 *                 type: string
 *                 example: "Bác sĩ có thái độ không tốt với bệnh nhân"
 *                 description: Nội dung khiếu nại
 *               complaint_type:
 *                 type: string
 *                 enum: [DOCTOR, CLINIC]
 *                 example: "DOCTOR"
 *                 description: Loại khiếu nại
 *               doctor_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: ID bác sĩ (bắt buộc nếu complaint_type = DOCTOR)
 *               clinic_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: ID phòng khám (bắt buộc nếu complaint_type = CLINIC)
 *               appointment_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: ID lịch hẹn (tùy chọn)
 *               evidence:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng URL bằng chứng (tùy chọn)
 *     responses:
 *       201:
 *         description: Tạo khiếu nại thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
router.post("/complaints", authRequired, complaintController.createComplaint);

/**
 * @openapi
 * /api/patient/complaints:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Lấy danh sách khiếu nại của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Số lượng khiếu nại mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_REVIEW, RESOLVED, DISMISSED]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: complaint_type
 *         schema:
 *           type: string
 *           enum: [DOCTOR, CLINIC]
 *         description: Lọc theo loại khiếu nại
 *     responses:
 *       200:
 *         description: Danh sách khiếu nại
 *       401:
 *         description: Chưa đăng nhập
 */
router.get("/complaints", authRequired, complaintController.getPatientComplaints);

/**
 * @openapi
 * /api/patient/complaints/{complaintId}:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Lấy chi tiết khiếu nại
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khiếu nại
 *     responses:
 *       200:
 *         description: Chi tiết khiếu nại
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy khiếu nại
 */
router.get("/complaints/:complaintId", authRequired, complaintController.getComplaintById);

/**
 * @openapi
 * /api/patient/relatives:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Lấy danh sách người thân của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 50
 *         description: Số lượng người thân mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách người thân
 *       401:
 *         description: Chưa đăng nhập
 */
router.get("/relatives", authRequired, relativeController.getRelatives);

/**
 * @openapi
 * /api/patient/relatives:
 *   post:
 *     tags:
 *       - Patient
 *     summary: Tạo người thân mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, phone, relationship]
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               email:
 *                 type: string
 *                 example: "example@email.com"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: "MALE"
 *               province_code:
 *                 type: string
 *                 example: "01"
 *               ward_code:
 *                 type: string
 *                 example: "00004"
 *               address:
 *                 type: string
 *                 example: "123 Đường ABC"
 *               relationship:
 *                 type: string
 *                 enum: [cha, me, con, vo_chong, anh_chi_em, ban, khac]
 *                 example: "cha"
 *               notes:
 *                 type: string
 *                 example: "Ghi chú thêm"
 *     responses:
 *       201:
 *         description: Tạo người thân thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
router.post("/relatives", authRequired, relativeController.createRelative);

/**
 * @openapi
 * /api/patient/relatives/deleted:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Lấy danh sách người thân đã bị xóa
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 50
 *         description: Số lượng người thân mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách người thân đã xóa
 *       401:
 *         description: Chưa đăng nhập
 */
router.get("/relatives/deleted", authRequired, relativeController.getDeletedRelatives);

/**
 * @openapi
 * /api/patient/relatives/{id}:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Lấy chi tiết người thân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người thân
 *     responses:
 *       200:
 *         description: Thông tin người thân
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy người thân
 */
router.get("/relatives/:id", authRequired, relativeController.getRelativeById);

/**
 * @openapi
 * /api/patient/relatives/{id}:
 *   put:
 *     tags:
 *       - Patient
 *     summary: Cập nhật thông tin người thân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người thân
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               province_code:
 *                 type: string
 *               ward_code:
 *                 type: string
 *               address:
 *                 type: string
 *               relationship:
 *                 type: string
 *                 enum: [cha, me, con, vo_chong, anh_chi_em, ban, khac]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy người thân
 */
router.put("/relatives/:id", authRequired, relativeController.updateRelative);

/**
 * @openapi
 * /api/patient/relatives/{id}:
 *   delete:
 *     tags:
 *       - Patient
 *     summary: Xóa người thân (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người thân
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy người thân
 */
router.delete("/relatives/:id", authRequired, relativeController.deleteRelative);

/**
 * @openapi
 * /api/patient/relatives/{id}/restore:
 *   post:
 *     tags:
 *       - Patient
 *     summary: Khôi phục người thân đã bị xóa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người thân
 *     responses:
 *       200:
 *         description: Khôi phục thành công
 *       400:
 *         description: Người thân đã active hoặc trùng số điện thoại
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy người thân
 */
router.post("/relatives/:id/restore", authRequired, relativeController.restoreRelative);

module.exports = router;


