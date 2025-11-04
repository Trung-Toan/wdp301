const mongoose = require("mongoose");
const Doctor = require("../../model/doctor/Doctor");
const Clinic = require("../../model/clinic/Clinic");
const Feedback = require("../../model/patient/Feedback");

async function getTopDoctors({ limit, provinceCode, wardCode }) {
    const doctorFilter = {};

    // Chỉ lọc theo province_code (thành phố), bỏ ward_code
    if (provinceCode) {
        const clinicFilter = { "address.province.code": String(provinceCode) };
        const clinics = await Clinic.find(clinicFilter).select("_id").lean();
        const clinicIds = clinics.map(c => c._id);

        if (clinicIds.length === 0) return [];

        doctorFilter.clinic_id = { $in: clinicIds };
    }

    // --- Lấy danh sách bác sĩ ---
    let query = Doctor.find(doctorFilter)
        .sort({ createdAt: -1 })
        .populate({
            path: "clinic_id",
            select: "name address",
            model: "Clinic",
        })
        .populate({
            path: "specialty_id",
            select: "name",
            model: "Specialty",
        })
        .populate({
            path: "user_id",
            select: "full_name avatar_url",
            model: "User",
        })
        .select("title degree description experience specialty_id clinic_id user_id createdAt")
        .lean();

    const doctors = await query;

    // --- Lấy rating trung bình + tổng feedback ---
    const doctorIds = doctors.map(d => d._id);
    const feedbackStats = await Feedback.aggregate([
        { $match: { doctor_id: { $in: doctorIds } } },
        {
            $group: {
                _id: "$doctor_id",
                averageRating: { $avg: "$rating" },
                totalFeedbacks: { $sum: 1 },
            },
        },
    ]);

    const ratingMap = feedbackStats.reduce((acc, cur) => {
        acc[cur._id.toString()] = {
            averageRating: cur.averageRating,
            totalFeedbacks: cur.totalFeedbacks,
        };
        return acc;
    }, {});

    // --- Trả kết quả ---
    const results = doctors.map(d => {
        const ratingData = ratingMap[d._id.toString()] || { averageRating: null, totalFeedbacks: 0 };
        const avg = ratingData.averageRating ? Number(ratingData.averageRating.toFixed(1)) : null;
        const total = ratingData.totalFeedbacks;

        return {
            _id: d._id,
            full_name: d.user_id ? d.user_id.full_name : null,
            avatar_url: d.user_id ? d.user_id.avatar_url : null,
            title: d.title,
            degree: d.degree,
            description: d.description,
            experience: d.experience,
            specialties: d.specialty_id
                ? d.specialty_id.map(s => ({ _id: s._id, name: s.name }))
                : [],
            clinic: d.clinic_id
                ? {
                    _id: d.clinic_id._id,
                    name: d.clinic_id.name,
                    address: d.clinic_id.address,
                }
                : null,
            rating: avg,
            totalFeedbacks: total,
            ratingDisplay:
                total === 0
                    ? "(0 đánh giá)"
                    : `${avg} (${total} đánh giá)`,
            createdAt: d.createdAt,
        };
    });

    // Chỉ hiển thị bác sĩ có rating >= 3.5
    const filtered = results.filter(item => item.rating !== null && item.rating >= 3.5);

    // Áp dụng limit sau khi lọc để đảm bảo đủ số lượng
    if (limit && Number(limit) > 0) {
        return filtered.slice(0, Number(limit));
    }

    return filtered;
}

module.exports = { getTopDoctors };
