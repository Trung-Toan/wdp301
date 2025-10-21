const mongoose = require("mongoose");
const Appointment = require("../../model/appointment/Appointment");
const Specialty = require("../../model/clinic/Specialty");
const Doctor = require("../../model/doctor/Doctor");


async function getBookingStatistics(clinicId, { startDate, endDate } = {}) {
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
        throw new Error("Invalid clinic ID");
    }

    const matchFilter = { clinic_id: new mongoose.Types.ObjectId(clinicId) };

    // Nếu có khoảng thời gian, thêm filter
    if (startDate || endDate) {
        matchFilter.booked_at = {};
        if (startDate) matchFilter.booked_at.$gte = new Date(startDate);
        if (endDate) matchFilter.booked_at.$lte = new Date(endDate);
    }

    // Aggregation pipeline để đếm số lượng đặt lịch theo trạng thái
    const pipeline = [
        { $match: matchFilter },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalRevenue: { $sum: "$fee_amount" }
            }
        },
        {
            $group: {
                _id: null,
                statusBreakdown: {
                    $push: {
                        status: "$_id",
                        count: "$count",
                        revenue: "$totalRevenue"
                    }
                },
                totalBookings: { $sum: "$count" },
                totalRevenue: { $sum: "$totalRevenue" }
            }
        }
    ];

    const [result] = await Appointment.aggregate(pipeline);

    if (!result) {
        return {
            totalBookings: 0,
            totalRevenue: 0,
            statusBreakdown: [],
            byStatus: {
                SCHEDULED: 0,
                COMPLETED: 0,
                CANCELLED: 0,
                NO_SHOW: 0
            }
        };
    }

    // Tạo object byStatus để dễ truy cập
    const byStatus = {
        SCHEDULED: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        NO_SHOW: 0
    };

    result.statusBreakdown.forEach(item => {
        byStatus[item.status] = item.count;
    });

    return {
        totalBookings: result.totalBookings,
        totalRevenue: result.totalRevenue,
        statusBreakdown: result.statusBreakdown,
        byStatus,
        completionRate: result.totalBookings > 0
            ? ((byStatus.COMPLETED / result.totalBookings) * 100).toFixed(2)
            : 0,
        cancellationRate: result.totalBookings > 0
            ? ((byStatus.CANCELLED / result.totalBookings) * 100).toFixed(2)
            : 0
    };
}


async function getBookingTrends(clinicId, { period = 'day', startDate, endDate } = {}) {
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
        throw new Error("Invalid clinic ID");
    }

    const matchFilter = { clinic_id: new mongoose.Types.ObjectId(clinicId) };

    if (startDate || endDate) {
        matchFilter.booked_at = {};
        if (startDate) matchFilter.booked_at.$gte = new Date(startDate);
        if (endDate) matchFilter.booked_at.$lte = new Date(endDate);
    }

    // Xác định format ngày theo period
    let dateFormat;
    switch (period) {
        case 'month':
            dateFormat = { year: { $year: "$booked_at" }, month: { $month: "$booked_at" } };
            break;
        case 'week':
            dateFormat = { year: { $year: "$booked_at" }, week: { $week: "$booked_at" } };
            break;
        case 'day':
        default:
            dateFormat = {
                year: { $year: "$booked_at" },
                month: { $month: "$booked_at" },
                day: { $dayOfMonth: "$booked_at" }
            };
            break;
    }

    const pipeline = [
        { $match: matchFilter },
        {
            $group: {
                _id: dateFormat,
                count: { $sum: 1 },
                revenue: { $sum: "$fee_amount" },
                scheduled: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
                noShow: { $sum: { $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0] } }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
    ];

    const results = await Appointment.aggregate(pipeline);

    return results.map(item => ({
        date: item._id,
        count: item.count,
        revenue: item.revenue,
        scheduled: item.scheduled,
        completed: item.completed,
        cancelled: item.cancelled,
        noShow: item.noShow
    }));
}

module.exports = {
    getBookingStatistics,
    getBookingTrends
};

