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

/**
 * Lấy thống kê top specialties (chuyên khoa phổ biến) theo clinic
 * @param {String} clinicId - ID của clinic
 * @param {Object} options - Các tùy chọn
 * @param {Date} options.startDate - Ngày bắt đầu
 * @param {Date} options.endDate - Ngày kết thúc
 * @param {Number} options.limit - Số lượng specialty trả về (default: 10)
 */
async function getTopSpecialties(clinicId, { startDate, endDate, limit = 10 } = {}) {
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

    const pipeline = [
        { $match: matchFilter },
        {
            $group: {
                _id: "$specialty_id",
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$fee_amount" },
                completedBookings: {
                    $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
                },
                cancelledBookings: {
                    $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: "specialties",
                localField: "_id",
                foreignField: "_id",
                as: "specialtyInfo"
            }
        },
        { $unwind: "$specialtyInfo" },
        {
            $project: {
                _id: 1,
                name: "$specialtyInfo.name",
                description: "$specialtyInfo.description",
                icon_url: "$specialtyInfo.icon_url",
                totalBookings: 1,
                totalRevenue: 1,
                completedBookings: 1,
                cancelledBookings: 1,
                completionRate: {
                    $cond: [
                        { $eq: ["$totalBookings", 0] },
                        0,
                        {
                            $multiply: [
                                { $divide: ["$completedBookings", "$totalBookings"] },
                                100
                            ]
                        }
                    ]
                },
                averageRevenuePerBooking: {
                    $cond: [
                        { $eq: ["$totalBookings", 0] },
                        0,
                        { $divide: ["$totalRevenue", "$totalBookings"] }
                    ]
                }
            }
        },
        { $sort: { totalBookings: -1 } },
        { $limit: Number(limit) }
    ];

    const results = await Appointment.aggregate(pipeline);

    // Tính tổng để có percentage
    const totalAll = results.reduce((sum, item) => sum + item.totalBookings, 0);

    return results.map(item => ({
        ...item,
        percentage: totalAll > 0 ? ((item.totalBookings / totalAll) * 100).toFixed(2) : 0,
        completionRate: item.completionRate.toFixed(2),
        averageRevenuePerBooking: Math.round(item.averageRevenuePerBooking)
    }));
}

/**
 * Lấy thống kê chi tiết của một specialty cụ thể
 * @param {String} clinicId - ID của clinic
 * @param {String} specialtyId - ID của specialty
 * @param {Object} options - Các tùy chọn
 */
async function getSpecialtyDetails(clinicId, specialtyId, { startDate, endDate } = {}) {
    if (!mongoose.Types.ObjectId.isValid(clinicId) || !mongoose.Types.ObjectId.isValid(specialtyId)) {
        throw new Error("Invalid clinic or specialty ID");
    }

    const matchFilter = {
        clinic_id: new mongoose.Types.ObjectId(clinicId),
        specialty_id: new mongoose.Types.ObjectId(specialtyId)
    };

    if (startDate || endDate) {
        matchFilter.booked_at = {};
        if (startDate) matchFilter.booked_at.$gte = new Date(startDate);
        if (endDate) matchFilter.booked_at.$lte = new Date(endDate);
    }

    const [stats, specialty] = await Promise.all([
        Appointment.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: "$fee_amount" },
                    scheduled: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
                    noShow: { $sum: { $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0] } }
                }
            }
        ]),
        Specialty.findById(specialtyId).lean()
    ]);

    if (!specialty) {
        throw new Error("Specialty not found");
    }

    const result = stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0
    };

    return {
        specialty: {
            _id: specialty._id,
            name: specialty.name,
            description: specialty.description,
            icon_url: specialty.icon_url
        },
        statistics: {
            totalBookings: result.totalBookings,
            totalRevenue: result.totalRevenue,
            averageRevenuePerBooking: result.totalBookings > 0
                ? Math.round(result.totalRevenue / result.totalBookings)
                : 0,
            statusBreakdown: {
                scheduled: result.scheduled,
                completed: result.completed,
                cancelled: result.cancelled,
                noShow: result.noShow
            },
            completionRate: result.totalBookings > 0
                ? ((result.completed / result.totalBookings) * 100).toFixed(2)
                : 0,
            cancellationRate: result.totalBookings > 0
                ? ((result.cancelled / result.totalBookings) * 100).toFixed(2)
                : 0
        }
    };
}



/**
 * Lấy thống kê hiệu suất của các bác sĩ trong clinic
 */
async function getDoctorPerformance(clinicId, { startDate, endDate, limit = 20, sortBy = 'totalBookings' } = {}) {
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
        throw new Error("Invalid clinic ID");
    }

    const matchFilter = { clinic_id: new mongoose.Types.ObjectId(clinicId) };

    if (startDate || endDate) {
        matchFilter.booked_at = {};
        if (startDate) matchFilter.booked_at.$gte = new Date(startDate);
        if (endDate) matchFilter.booked_at.$lte = new Date(endDate);
    }

    // Xác định field để sort
    let sortField = {};
    switch (sortBy) {
        case 'completionRate':
            sortField = { completionRate: -1 };
            break;
        case 'totalBookings':
        default:
            sortField = { totalBookings: -1 };
            break;
    }

    const pipeline = [
        { $match: matchFilter },
        {
            $group: {
                _id: "$doctor_id",
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$fee_amount" },
                scheduled: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
                noShow: { $sum: { $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0] } }
            }
        },
        {
            $lookup: {
                from: "doctors",
                localField: "_id",
                foreignField: "_id",
                as: "doctorInfo"
            }
        },
        { $unwind: "$doctorInfo" },
        {
            $lookup: {
                from: "users",
                localField: "doctorInfo.user_id",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },
        {
            $lookup: {
                from: "specialties",
                localField: "doctorInfo.specialty_id",
                foreignField: "_id",
                as: "specialties"
            }
        },
        {
            $project: {
                _id: 1,
                doctor: {
                    _id: "$doctorInfo._id",
                    title: "$doctorInfo.title",
                    degree: "$doctorInfo.degree",
                    description: "$doctorInfo.description",
                    experience: "$doctorInfo.experience",
                    full_name: "$userInfo.full_name"
                },
                specialties: {
                    $map: {
                        input: "$specialties",
                        as: "spec",
                        in: {
                            _id: "$$spec._id",
                            name: "$$spec.name"
                        }
                    }
                },
                statistics: {
                    totalBookings: "$totalBookings",
                    totalRevenue: "$totalRevenue",
                    scheduled: "$scheduled",
                    completed: "$completed",
                    cancelled: "$cancelled",
                    noShow: "$noShow",
                    completionRate: {
                        $cond: [
                            { $eq: ["$totalBookings", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$completed", "$totalBookings"] },
                                    100
                                ]
                            }
                        ]
                    },
                    cancellationRate: {
                        $cond: [
                            { $eq: ["$totalBookings", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$cancelled", "$totalBookings"] },
                                    100
                                ]
                            }
                        ]
                    },
                    averageRevenuePerBooking: {
                        $cond: [
                            { $eq: ["$totalBookings", 0] },
                            0,
                            { $divide: ["$totalRevenue", "$totalBookings"] }
                        ]
                    }
                },
                totalBookings: "$totalBookings",
                completionRate: {
                    $cond: [
                        { $eq: ["$totalBookings", 0] },
                        0,
                        {
                            $multiply: [
                                { $divide: ["$completed", "$totalBookings"] },
                                100
                            ]
                        }
                    ]
                }
            }
        },
        { $sort: sortField },
        { $limit: Number(limit) }
    ];

    const results = await Appointment.aggregate(pipeline);

    return results.map(item => ({
        doctor: item.doctor,
        specialties: item.specialties,
        statistics: {
            ...item.statistics,
            completionRate: parseFloat(item.statistics.completionRate.toFixed(2)),
            cancellationRate: parseFloat(item.statistics.cancellationRate.toFixed(2)),
            averageRevenuePerBooking: Math.round(item.statistics.averageRevenuePerBooking)
        }
    }));
}

/**
 * Lấy thống kê chi tiết của một bác sĩ cụ thể
 */
async function getDoctorDetailedPerformance(clinicId, doctorId, { startDate, endDate } = {}) {
    if (!mongoose.Types.ObjectId.isValid(clinicId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new Error("Invalid clinic or doctor ID");
    }

    const matchFilter = {
        clinic_id: new mongoose.Types.ObjectId(clinicId),
        doctor_id: new mongoose.Types.ObjectId(doctorId)
    };

    if (startDate || endDate) {
        matchFilter.booked_at = {};
        if (startDate) matchFilter.booked_at.$gte = new Date(startDate);
        if (endDate) matchFilter.booked_at.$lte = new Date(endDate);
    }

    // Lấy thông tin bác sĩ và statistics
    const [stats, doctor] = await Promise.all([
        Appointment.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: "$fee_amount" },
                    scheduled: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
                    noShow: { $sum: { $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0] } }
                }
            }
        ]),
        Doctor.findById(doctorId)
            .populate('user_id', 'full_name')
            .populate('specialty_id', 'name')
            .lean()
    ]);

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    const result = stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0
    };

    // Lấy xu hướng theo thời gian (theo ngày)
    const trendsPipeline = [
        { $match: matchFilter },
        {
            $group: {
                _id: {
                    year: { $year: "$booked_at" },
                    month: { $month: "$booked_at" },
                    day: { $dayOfMonth: "$booked_at" }
                },
                count: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        { $limit: 30 } // Lấy 30 ngày gần nhất
    ];

    const trends = await Appointment.aggregate(trendsPipeline);

    return {
        doctor: {
            _id: doctor._id,
            title: doctor.title,
            degree: doctor.degree,
            description: doctor.description,
            experience: doctor.experience,
            full_name: doctor.user_id?.full_name
        },
        specialties: Array.isArray(doctor.specialty_id)
            ? doctor.specialty_id.map(s => ({ _id: s._id, name: s.name }))
            : [],
        statistics: {
            totalBookings: result.totalBookings,
            totalRevenue: result.totalRevenue,
            averageRevenuePerBooking: result.totalBookings > 0
                ? Math.round(result.totalRevenue / result.totalBookings)
                : 0,
            statusBreakdown: {
                scheduled: result.scheduled,
                completed: result.completed,
                cancelled: result.cancelled,
                noShow: result.noShow
            },
            completionRate: result.totalBookings > 0
                ? parseFloat(((result.completed / result.totalBookings) * 100).toFixed(2))
                : 0,
            cancellationRate: result.totalBookings > 0
                ? parseFloat(((result.cancelled / result.totalBookings) * 100).toFixed(2))
                : 0,
            noShowRate: result.totalBookings > 0
                ? parseFloat(((result.noShow / result.totalBookings) * 100).toFixed(2))
                : 0
        },
        trends: trends.map(t => ({
            date: t._id,
            totalBookings: t.count,
            completedBookings: t.completed
        }))
    };
}

module.exports = {
    getBookingStatistics,
    getBookingTrends,
    getTopSpecialties,
    getSpecialtyDetails,
    getDoctorPerformance,
    getDoctorDetailedPerformance
};

