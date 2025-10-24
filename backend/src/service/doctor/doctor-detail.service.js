const mongoose = require("mongoose");
const Doctor = require("../../model/doctor/Doctor");

async function getDoctorDetailFull(doctorId, { from, to, limitSlot = 10 } = {}) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new Error("Invalid doctorId");
    }

    const _id = new mongoose.Types.ObjectId(doctorId);
    const now = from ? new Date(from) : new Date();

    const pipeline = [
        { $match: { _id } },

        // === Lookup User (bác sĩ)
        { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },

        // === Lookup Clinic
        { $lookup: { from: "clinics", localField: "clinic_id", foreignField: "_id", as: "clinic" } },
        { $unwind: { path: "$clinic", preserveNullAndEmptyArrays: true } },

        // === Lookup Specialty
        { $lookup: { from: "specialties", localField: "specialty_id", foreignField: "_id", as: "specialties" } },

        // === Lookup Licenses
        {
            $lookup: {
                from: "licenses",
                let: { docId: { $toString: "$_id" } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [{ $toString: "$doctor_id" }, "$$docId"]
                            }
                        }
                    }
                ],
                as: "licenses"
            }
        },

        // === Lookup Feedbacks + thông tin người comment
        {
            $lookup: {
                from: "feedbacks",
                let: { docId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$doctor_id", "$$docId"] }
                        }
                    },
                    // Join sang bảng Patient
                    {
                        $lookup: {
                            from: "patients",
                            localField: "patient_id",
                            foreignField: "_id",
                            as: "patient"
                        }
                    },
                    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },

                    // Join tiếp sang bảng User để lấy tên và avatar
                    {
                        $lookup: {
                            from: "users",
                            localField: "patient.user_id",
                            foreignField: "_id",
                            as: "patient_user"
                        }
                    },
                    { $unwind: { path: "$patient_user", preserveNullAndEmptyArrays: true } },

                    {
                        $project: {
                            _id: 1,
                            rating: 1,
                            comment: 1,
                            is_annonymous: 1,
                            createdAt: 1,
                            patient: {
                                full_name: "$patient_user.full_name",
                                avatar_url: "$patient_user.avatar_url"
                            }
                        }
                    }
                ],
                as: "feedbacks"
            }
        },

        // === Lookup Slots
        {
            $lookup: {
                from: "slots",
                let: { docId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$doctor_id", "$$docId"] },
                                    { $eq: ["$status", "AVAILABLE"] },
                                    { $lt: ["$booked_count", "$max_patients"] },
                                    { $gte: ["$start_time", now] },
                                ],
                            },
                        },
                    },
                    ...(to ? [{ $match: { start_time: { $lte: new Date(to) } } }] : []),
                    { $sort: { start_time: 1 } },
                    {
                        $lookup: {
                            from: "clinics",
                            localField: "clinic_id",
                            foreignField: "_id",
                            as: "slotClinic",
                        },
                    },
                    { $unwind: { path: "$slotClinic", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1,
                            start_time: 1,
                            end_time: 1,
                            fee_amount: 1,
                            clinic_id: 1,
                            clinic_name: "$slotClinic.name",
                        },
                    },
                    ...(limitSlot ? [{ $limit: Number(limitSlot) }] : []),
                ],
                as: "slots",
            },
        },

        // === Tính min/max giá và rating trung bình
        {
            $addFields: {
                minFee: { $min: "$slots.fee_amount" },
                maxFee: { $max: "$slots.fee_amount" },
                averageRating: { $avg: "$feedbacks.rating" },
                totalFeedbacks: { $size: "$feedbacks" },
            },
        },

        // === Chọn trường cần thiết
        {
            $project: {
                _id: 1,
                title: 1,
                degree: 1,
                description: 1,
                experience: 1,
                user: { _id: 1, full_name: 1, avatar_url: 1 },
                clinic: { _id: 1, name: 1, address: 1 },
                specialties: { _id: 1, name: 1, icon_url: 1 },
                licenses: 1,
                feedbacks: 1,
                slots: 1,
                minFee: 1,
                maxFee: 1,
                averageRating: 1,
                totalFeedbacks: 1,
            },
        },
    ];

    const [doc] = await Doctor.aggregate(pipeline).allowDiskUse(true);

    if (!doc) return null;

    return {
        id: String(doc._id),
        name: doc.user?.full_name ?? "",
        title: doc.title ?? null,
        degree: doc.degree ?? null,
        description: doc.description ?? null,
        experience: doc.experience ?? null,
        avatar_url: doc.user?.avatar_url ?? null,
        clinic: doc.clinic
            ? {
                id: String(doc.clinic._id),
                name: doc.clinic.name,
                province: doc.clinic.address?.province?.name || null,
                ward: doc.clinic.address?.ward?.name || null,
                houseNumber: doc.clinic.address?.houseNumber || null,
                street: doc.clinic.address?.street || null,
                alley: doc.clinic.address?.alley || null,
            }
            : null,
        specialties: (doc.specialties || []).map((s) => ({
            id: String(s._id),
            name: s.name,
            icon_url: s.icon_url || null,
        })),
        licenses: (doc.licenses || []).map((l) => ({
            id: String(l._id),
            licenseNumber: l.licenseNumber,
            issued_by: l.issued_by,
            issued_date: l.issued_date,
            expiry_date: l.expiry_date,
            document_url: l.document_url,
            status: l.status,
            approved_at: l.approved_at,
            rejected_reason: l.rejected_reason || null,
        })),
        feedbacks: (doc.feedbacks || []).map((f) => ({
            id: String(f._id),
            rating: f.rating,
            comment: f.comment,
            is_annonymous: f.is_annonymous,
            createdAt: f.createdAt,
            patient: f.is_annonymous
                ? { full_name: "Người dùng ẩn danh", avatar_url: "/default-avatar.png" }
                : {
                    full_name: f.patient?.full_name || "Người dùng",
                    avatar_url: f.patient?.avatar_url || null,
                },
        })),
        rating: {
            average: doc.averageRating ?? 0,
            total: doc.totalFeedbacks ?? 0,
        },
        pricing: {
            minFee: doc.minFee ?? null,
            maxFee: doc.maxFee ?? null,
            currency: "VND",
        },
        slots: doc.slots || [],
    };
}

module.exports = { getDoctorDetailFull };
