const statisticsService = require("../../service/clinic/statistics.service");
const { successResponse, errorResponse } = require("../../utils/responseUtils");

/**
 * Controller để lấy thống kê số lượng đặt lịch
 * GET /api/clinics/:clinicId/statistics/bookings
 */
exports.getBookingStatistics = async (req, res) => {
    try {
        const { clinicId } = req.params;

        const { startDate, endDate } = req.query;

        const statistics = await statisticsService.getBookingStatistics(clinicId, {
            startDate,
            endDate
        });

        return successResponse(res, statistics, "Lấy thống kê đặt lịch thành công");
    } catch (error) {
        console.error("Error in getBookingStatistics:", error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Controller để lấy xu hướng đặt lịch theo thời gian
 * GET /api/clinics/:clinicId/statistics/bookings/trends
 */
exports.getBookingTrends = async (req, res) => {
    try {
        const { clinicId } = req.params;

        const { period, startDate, endDate } = req.query;

        const trends = await statisticsService.getBookingTrends(clinicId, {
            period: period || 'day',
            startDate,
            endDate
        });

        return successResponse(res, trends, "Lấy xu hướng đặt lịch thành công");
    } catch (error) {
        console.error("Error in getBookingTrends:", error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Controller để lấy top specialties (chuyên khoa phổ biến)
 * GET /api/clinics/:clinicId/statistics/specialties/top
 */
exports.getTopSpecialties = async (req, res) => {
    try {
        const { clinicId } = req.params;

        const { startDate, endDate, limit } = req.query;

        const topSpecialties = await statisticsService.getTopSpecialties(clinicId, {
            startDate,
            endDate,
            limit: limit ? parseInt(limit) : 10
        });

        return successResponse(res, topSpecialties, "Lấy top specialties thành công");
    } catch (error) {
        console.error("Error in getTopSpecialties:", error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Controller để lấy chi tiết thống kê của một specialty
 * GET /api/clinics/:clinicId/statistics/specialties/:specialtyId
 */
exports.getSpecialtyDetails = async (req, res) => {
    try {
        const { clinicId, specialtyId } = req.params;

        const { startDate, endDate } = req.query;

        const details = await statisticsService.getSpecialtyDetails(clinicId, specialtyId, {
            startDate,
            endDate
        });

        return successResponse(res, details, "Lấy chi tiết specialty thành công");
    } catch (error) {
        console.error("Error in getSpecialtyDetails:", error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Controller để lấy thống kê hiệu suất bác sĩ
 * GET /api/clinics/:clinicId/statistics/doctors/performance
 */
exports.getDoctorPerformance = async (req, res) => {
    try {
        const { clinicId } = req.params;

        const { startDate, endDate, limit, sortBy } = req.query;

        const performance = await statisticsService.getDoctorPerformance(clinicId, {
            startDate,
            endDate,
            limit: limit ? parseInt(limit) : 20,
            sortBy: sortBy || 'totalBookings'
        });

        return successResponse(res, performance, "Lấy hiệu suất bác sĩ thành công");
    } catch (error) {
        console.error("Error in getDoctorPerformance:", error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Controller để lấy thống kê chi tiết hiệu suất của một bác sĩ
 * GET /api/clinics/:clinicId/statistics/doctors/:doctorId
 */
exports.getDoctorDetailedPerformance = async (req, res) => {
    try {
        const { clinicId, doctorId } = req.params;

        const { startDate, endDate } = req.query;

        const details = await statisticsService.getDoctorDetailedPerformance(clinicId, doctorId, {
            startDate,
            endDate
        });

        return successResponse(res, details, "Lấy chi tiết hiệu suất bác sĩ thành công");
    } catch (error) {
        console.error("Error in getDoctorDetailedPerformance:", error);
        return errorResponse(res, error.message, 500);
    }
};

