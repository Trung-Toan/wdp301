const router = require("express").Router();
const { getClinicsByFilters } = require("../../controller/clinic/filterClinic.controller");
const { searchDoctorController } = require("../../controller/doctor/searchDoctors.controller");
const ctrl = require("../../controller/clinic/specialty.controller");
const clinicCtrl = require("../../controller/clinic/clinic.controller");
const statisticsCtrl = require("../../controller/clinic/statistics.controller");


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

module.exports = router;
