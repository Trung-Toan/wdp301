const Clinic = require("../../model/clinic/Clinic");
const Doctor = require("../../model/doctor/Doctor");
const Feedback = require("../../model/patient/Feedback");
const Appointment = require("../../model/appointment/Appointment");
const mongoose = require("mongoose");

/**
 * Lấy thông tin chi tiết clinic bao gồm specialties
 */
async function getClinicDetail(clinicId) {
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
        throw new Error("Invalid clinic ID");
    }

    const clinic = await Clinic.findById(clinicId)
        .populate({
            path: "specialties",
            select: "_id name description icon_url status",
        })
        .populate({
            path: "created_by",
            select: "_id name email",
        })
        .populate({
            path: "address_detail",
        })
        .lean();

    if (!clinic) {
        throw new Error("Clinic not found");
    }

    // Tính rating trung bình từ feedback của các doctor trong clinic này
    const doctors = await Doctor.find({ clinic_id: clinicId }).select("_id").lean();

    const doctorIds = doctors.map((d) => d._id);

    const feedbacks = await Feedback.find({ doctor_id: { $in: doctorIds } }).lean();

    const avgRating = feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
        : 0;
    const totalReviews = feedbacks.length;

    // Đếm số lượng bác sĩ
    const doctorCount = doctors.length;

    // Đếm số lượng appointments
    const appointmentCount = await Appointment.countDocuments({ clinic_id: clinicId });

    return {
        id: clinic._id,
        name: clinic.name,
        phone: clinic.phone,
        email: clinic.email,
        website: clinic.website,
        description: clinic.description,
        logo_url: clinic.logo_url,
        banner_url: clinic.banner_url,
        registration_number: clinic.registration_number,
        opening_hours: clinic.opening_hours,
        closing_hours: clinic.closing_hours,
        status: clinic.status,
        address: clinic.address || null,
        address_detail: clinic.address_detail || null,
        specialties: clinic.specialties?.map((s) => ({
            id: s._id,
            name: s.name,
            description: s.description,
            icon_url: s.icon_url,
            status: s.status,
        })) || [],
        created_by: clinic.created_by
            ? {
                id: clinic.created_by._id,
                name: clinic.created_by.name,
                email: clinic.created_by.email,
            }
            : null,
        // Thêm thông tin thống kê
        rating: parseFloat(avgRating.toFixed(1)),
        total_reviews: totalReviews,
        doctor_count: doctorCount,
        appointment_count: appointmentCount,
        createdAt: clinic.createdAt,
        updatedAt: clinic.updatedAt,
    };
}

/**
 * Lấy danh sách bác sĩ của clinic
 */
async function getClinicDoctors(clinicId, { specialtyId, limit = 20, page = 1 } = {}) {
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
        throw new Error("Invalid clinic ID");
    }

    const match = { clinic_id: new mongoose.Types.ObjectId(clinicId) };
    if (specialtyId && mongoose.Types.ObjectId.isValid(specialtyId)) {
        match.specialty_id = new mongoose.Types.ObjectId(specialtyId);
    }

    const pipeline = [
        { $match: match },
        // Populate user information
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        // Populate specialties
        {
            $lookup: {
                from: "specialties",
                localField: "specialty_id",
                foreignField: "_id",
                as: "specialties",
            },
        },
        // Populate clinic
        {
            $lookup: {
                from: "clinics",
                localField: "clinic_id",
                foreignField: "_id",
                as: "clinic",
            },
        },
        { $unwind: "$clinic" },
        // Calculate average rating
        {
            $lookup: {
                from: "feedbacks",
                localField: "_id",
                foreignField: "doctor_id",
                as: "feedbacks",
            },
        },
        {
            $addFields: {
                avgRating: {
                    $cond: {
                        if: { $gt: [{ $size: "$feedbacks" }, 0] },
                        then: { $avg: "$feedbacks.rating" },
                        else: 0,
                    },
                },
                reviewCount: { $size: "$feedbacks" },
            },
        },
        // Select and format
        {
            $project: {
                _id: 1,
                title: 1,
                degree: 1,
                description: 1,
                experience: 1,
                clinic_id: 1,
                specialty_id: 1,
                user: {
                    _id: "$user._id",
                    full_name: "$user.full_name",
                    avatar_url: "$user.avatar_url",
                },
                specialties: {
                    $map: {
                        input: "$specialties",
                        as: "spec",
                        in: {
                            id: "$$spec._id",
                            name: "$$spec.name",
                            description: "$$spec.description",
                            icon_url: "$$spec.icon_url",
                        },
                    },
                },
                clinic: {
                    id: "$clinic._id",
                    name: "$clinic.name",
                },
                rating: { $round: ["$avgRating", 1] },
                review_count: "$reviewCount",
            },
        },
        { $sort: { rating: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ];

    const [doctors, total] = await Promise.all([
        Doctor.aggregate(pipeline),
        Doctor.countDocuments(match),
    ]);

    return {
        data: doctors.map((doc) => ({
            id: doc._id,
            title: doc.title,
            degree: doc.degree,
            description: doc.description,
            experience: doc.experience,
            user: doc.user,
            specialties: doc.specialties,
            clinic: doc.clinic,
            rating: doc.rating,
            review_count: doc.review_count,
        })),
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
}

/**
 * Lấy reviews/feedback của clinic thông qua các doctor trong clinic
 */
async function getClinicReviews(clinicId, { limit = 20, page = 1 } = {}) {
    if (!mongoose.Types.ObjectId.isValid(clinicId)) {
        throw new Error("Invalid clinic ID");
    }

    // Lấy tất cả doctors của clinic
    const doctors = await Doctor.find({ clinic_id: clinicId }).select("_id").lean();

    const doctorIds = doctors.map((d) => new mongoose.Types.ObjectId(d._id));

    if (doctorIds.length === 0) {
        return {
            data: [],
            meta: {
                total: 0,
                page,
                limit,
                totalPages: 0,
            },
        };
    }

    const pipeline = [
        // Match feedbacks của các doctor trong clinic
        {
            $match: {
                doctor_id: { $in: doctorIds },
            },
        },
        // Lookup doctor info
        {
            $lookup: {
                from: "doctors",
                localField: "doctor_id",
                foreignField: "_id",
                as: "doctor",
            },
        },
        { $unwind: "$doctor" },
        // Lookup user info của doctor
        {
            $lookup: {
                from: "users",
                localField: "doctor.user_id",
                foreignField: "_id",
                as: "doctorUser",
            },
        },
        { $unwind: "$doctorUser" },
        // Lookup patient info
        {
            $lookup: {
                from: "patients",
                localField: "patient_id",
                foreignField: "_id",
                as: "patient",
            },
        },
        { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
        // Lookup user info của patient
        {
            $lookup: {
                from: "users",
                localField: "patient.user_id",
                foreignField: "_id",
                as: "patientUser",
            },
        },
        { $unwind: { path: "$patientUser", preserveNullAndEmptyArrays: true } },
        // Project và format
        {
            $project: {
                _id: 1,
                rating: 1,
                comment: 1,
                is_annonymous: 1,
                doctor: {
                    id: "$doctor._id",
                    name: "$doctorUser.full_name",
                    avatar: "$doctorUser.avatar_url",
                },
                patient: {
                    id: "$patient._id",
                    name: {
                        $cond: {
                            if: "$is_annonymous",
                            then: "Ẩn danh",
                            else: "$patientUser.full_name",
                        },
                    },
                    avatar: {
                        $cond: {
                            if: "$is_annonymous",
                            then: null,
                            else: "$patientUser.avatar_url",
                        },
                    },
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ];

    const [reviews, total] = await Promise.all([
        Feedback.aggregate(pipeline),
        Feedback.countDocuments({ doctor_id: { $in: doctorIds } }),
    ]);

    return {
        data: reviews,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
}

module.exports = {
    getClinicDetail,
    getClinicDoctors,
    getClinicReviews,
};

