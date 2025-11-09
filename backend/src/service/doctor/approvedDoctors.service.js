const mongoose = require("mongoose");
const Doctor = require("../../model/doctor/Doctor");
const Clinic = require("../../model/clinic/Clinic");
const Feedback = require("../../model/patient/Feedback");
const License = require("../../model/clinic/License");

/**
 * Lấy tất cả bác sĩ có bằng cấp đã được duyệt (license status = APPROVED)
 * @param {Object} params - Query parameters
 * @param {Number} params.limit - Giới hạn số lượng kết quả (0 = không giới hạn)
 * @param {String} params.provinceCode - Mã tỉnh/thành phố để lọc
 * @returns {Array} Danh sách bác sĩ có license đã được duyệt
 */
async function getApprovedDoctors({ limit, provinceCode } = {}) {
    try {
        // Bước 1: Lấy tất cả license có status = APPROVED và chưa hết hạn
        const now = new Date();
        const approvedLicenses = await License.find({
            status: "APPROVED",
            expiry_date: { $gte: now }, // Chỉ lấy license chưa hết hạn
        })
            .select("doctor_id")
            .lean();

        // Lấy danh sách doctor_id từ approved licenses (loại bỏ duplicate)
        const approvedDoctorIds = [...new Set(
            approvedLicenses.map((license) => license.doctor_id.toString())
        )].map((id) => new mongoose.Types.ObjectId(id));

        if (approvedDoctorIds.length === 0) {
            return [];
        }

        // Bước 2: Lọc doctors theo province nếu có
        const doctorFilter = {
            _id: { $in: approvedDoctorIds },
        };

        if (provinceCode) {
            const clinicFilter = { "address.province.code": String(provinceCode) };
            const clinics = await Clinic.find(clinicFilter).select("_id").lean();
            const clinicIds = clinics.map((c) => c._id);

            if (clinicIds.length === 0) return [];

            doctorFilter.clinic_id = { $in: clinicIds };
        }

        // Bước 3: Lấy danh sách bác sĩ với populate
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

        // Bước 4: Lấy rating trung bình + tổng feedback
        const doctorIds = doctors.map((d) => d._id);
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

        // Bước 5: Map kết quả
        const results = doctors.map((d) => {
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
                    ? d.specialty_id.map((s) => ({ _id: s._id, name: s.name }))
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

        // Bước 6: Áp dụng limit nếu có
        if (limit && Number(limit) > 0) {
            return results.slice(0, Number(limit));
        }

        return results;
    } catch (error) {
        console.error("Error in getApprovedDoctors:", error);
        throw error;
    }
}

module.exports = { getApprovedDoctors };

