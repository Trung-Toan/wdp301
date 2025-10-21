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
