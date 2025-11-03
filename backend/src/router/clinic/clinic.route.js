const router = require("express").Router();
const { getClinicsByFilters } = require("../../controller/clinic/filterClinic.controller");
const { searchDoctorController } = require("../../controller/doctor/searchDoctors.controller");
const ctrl = require("../../controller/clinic/specialty.controller");
const clinicCtrl = require("../../controller/clinic/clinic.controller");
const statisticsCtrl = require("../../controller/clinic/statistics.controller");
const { getTopClinicsController } = require("../../controller/clinic/topClinics.controller");
const clinicBookingCtrl = require("../../controller/clinic/clinicBooking.controller");
const { validateClinicBooking } = require("../../middleware/validateAppointment");

/**
 * @swagger
 * /api/clinic/search:
 *   get:
 *     tags: [Clinic]
 *     summary: Tìm phòng khám theo tỉnh/thành, phường/xã và chuyên khoa
 *     parameters:
 *       - in: query
 *         name: provinceCode
 *         schema: { type: string, example: "79" }
 *       - in: query
 *         name: wardCode
 *         schema: { type: string, example: "27343" }
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
 *         description: Danh sách phòng khám phù hợp
 */
router.get("/search", getClinicsByFilters);

/**
 * @swagger
 * /api/clinic/top:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy top phòng khám được book nhiều nhất
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
 *         description: Số lượng phòng khám tối đa
 *       - in: query
 *         name: statuses
 *         schema: { type: string, example: "SCHEDULED,APPROVE,COMPLETED" }
 *         description: Các trạng thái appointment để đếm
 *     responses:
 *       200:
 *         description: Danh sách top phòng khám
 */
router.get("/top", getTopClinicsController);

/**
 * @swagger
 * /api/clinic/book:
 *   post:
 *     tags: [Clinic]
 *     summary: Đặt lịch khám tại phòng khám
 *     description: "Đặt lịch khám với các trường từ form. Hỗ trợ auto-assign doctor và slot nếu auto_assign = true"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clinic_id, specialty_id, scheduled_date, patient_id, full_name, phone, email]
 *             properties:
 *               clinic_id:
 *                 type: string
 *                 description: ID của phòng khám
 *                 example: "670d29117f9f1b2c3d4e5901"
 *               specialty_id:
 *                 type: string
 *                 description: ID của chuyên khoa
 *                 example: "670d299e7f9f1b2c3d4e59ff"
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày khám (YYYY-MM-DD)
 *                 example: "2025-10-21"
 *               patient_id:
 *                 type: string
 *                 description: ID của bệnh nhân
 *                 example: "670d2c4a7f9f1b2c3d4e5b34"
 *               auto_assign:
 *                 type: boolean
 *                 description: "Để phòng khám tự động chọn bác sĩ và slot. Nếu true, doctor_id và slot_id không bắt buộc"
 *                 default: false
 *                 example: true
 *               doctor_id:
 *                 type: string
 *                 description: "ID của bác sĩ (bắt buộc nếu auto_assign = false)"
 *                 example: "670d2a1f7f9f1b2c3d4e5a12"
 *               slot_id:
 *                 type: string
 *                 description: "ID của slot (bắt buộc nếu auto_assign = false, sẽ tự động tìm nếu auto_assign = true)"
 *                 example: "670d2f5f7f9f1b2c3d4e5f60"
 *               full_name:
 *                 type: string
 *                 description: Họ tên bệnh nhân
 *                 example: "Nguyễn Nam Phong"
 *               phone:
 *                 type: string
 *                 description: Số điện thoại
 *                 example: "0985843234"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email
 *                 example: "patient@example.com"
 *               reason:
 *                 type: string
 *                 description: Lý do khám (tùy chọn)
 *                 example: "Đau đầu, mỏi mắt"
 *     responses:
 *       201:
 *         description: Đặt lịch thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     booking_code:
 *                       type: string
 *                       example: "BK123456"
 *                     status:
 *                       type: string
 *                       example: "SCHEDULED"
 *                     auto_assigned_doctor:
 *                       type: boolean
 *                       example: true
 *                     auto_assigned_slot:
 *                       type: boolean
 *                       example: true
 *                     doctor_id:
 *                       type: object
 *                     clinic_id:
 *                       type: object
 *                     specialty_id:
 *                       type: object
 *                     slot_info:
 *                       type: object
 *       400:
 *         description: Lỗi validation hoặc dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy bác sĩ hoặc slot phù hợp
 *       409:
 *         description: Trùng đặt lịch
 */
router.post("/book", validateClinicBooking, clinicBookingCtrl.createClinicBooking);

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

router.get("/specialties/:specialtyId", ctrl.getSpecialtyById)


/**
 * @swagger
 * /api/clinic/{clinicId}/statistics/bookings:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy thống kê số lượng đặt lịch theo clinic
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *         description: ID của clinic
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Thống kê đặt lịch thành công
 */
router.get("/:clinicId/statistics/bookings", statisticsCtrl.getBookingStatistics);

/**
 * @swagger
 * /api/clinic/{clinicId}/statistics/bookings/trends:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy xu hướng đặt lịch theo thời gian
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *         description: ID của clinic
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [day, week, month], default: day }
 *         description: Khoảng thời gian thống kê
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Xu hướng đặt lịch thành công
 */
router.get("/:clinicId/statistics/bookings/trends", statisticsCtrl.getBookingTrends);

/**
 * @swagger
 * /api/clinic/{clinicId}/statistics/specialties/top:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy top specialties (chuyên khoa phổ biến nhất)
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *         description: ID của clinic
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Số lượng specialties trả về
 *     responses:
 *       200:
 *         description: Lấy top specialties thành công
 */
router.get("/:clinicId/statistics/specialties/top", statisticsCtrl.getTopSpecialties);

/**
 * @swagger
 * /api/clinic/{clinicId}/statistics/specialties/{specialtyId}:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy chi tiết thống kê của một specialty
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *         description: ID của clinic
 *       - in: path
 *         name: specialtyId
 *         required: true
 *         schema: { type: string }
 *         description: ID của specialty
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lấy chi tiết specialty thành công
 */
router.get("/:clinicId/statistics/specialties/:specialtyId", statisticsCtrl.getSpecialtyDetails);

/**
 * @swagger
 * /api/clinic/{clinicId}/statistics/doctors/performance:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy thống kê hiệu suất của các bác sĩ
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *         description: ID của clinic
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Số lượng bác sĩ trả về
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [totalBookings, completionRate, rating], default: totalBookings }
 *         description: Sắp xếp theo
 *     responses:
 *       200:
 *         description: Lấy hiệu suất bác sĩ thành công
 */
router.get("/:clinicId/statistics/doctors/performance", statisticsCtrl.getDoctorPerformance);

/**
 * @swagger
 * /api/clinic/{clinicId}/statistics/doctors/{doctorId}:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy thống kê chi tiết hiệu suất của một bác sĩ
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *         description: ID của clinic
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string }
 *         description: ID của bác sĩ
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lấy chi tiết hiệu suất bác sĩ thành công
 */
router.get("/:clinicId/statistics/doctors/:doctorId", statisticsCtrl.getDoctorDetailedPerformance);

router.get("/allClinic", clinicCtrl.getAllClinic);

// Import clinic detail controller
const clinicDetailCtrl = require("../../controller/clinic/clinicDetail.controller");

/**
 * @swagger
 * /api/clinic/{clinicId}:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy thông tin chi tiết clinic
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thông tin chi tiết clinic
 */
router.get("/:clinicId", clinicDetailCtrl.getClinicDetail);

/**
 * @swagger
 * /api/clinic/{clinicId}/doctors:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy danh sách bác sĩ của clinic
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: specialtyId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 */
router.get("/:clinicId/doctors", clinicDetailCtrl.getClinicDoctors);

/**
 * @swagger
 * /api/clinic/{clinicId}/reviews:
 *   get:
 *     tags: [Clinic]
 *     summary: Lấy đánh giá của clinic
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Danh sách đánh giá
 */
router.get("/:clinicId/reviews", clinicDetailCtrl.getClinicReviews);

module.exports = router;
