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

        // Thông tin user (tên, avatar)
        { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },

        // Phòng khám
        { $lookup: { from: "clinics", localField: "clinic_id", foreignField: "_id", as: "clinic" } },
        { $unwind: { path: "$clinic", preserveNullAndEmptyArrays: true } },

        // Chuyên khoa
        { $lookup: { from: "specialties", localField: "specialty_id", foreignField: "_id", as: "specialties" } },

        // Lấy slot liên quan
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

        // Tính giá min/max
        {
            $addFields: {
                minFee: { $min: "$slots.fee_amount" },
                maxFee: { $max: "$slots.fee_amount" },
            },
        },

        // Lọc thông tin
        {
            $project: {
                _id: 1,
                title: 1,
                degree: 1,
                workplace: 1,
                rating: 1,
                doctor_avatar_url: "$avatar_url",
                user: { _id: 1, full_name: 1, avatar_url: 1 },
                clinic: { _id: 1, name: 1, address: 1 },
                specialties: { _id: 1, name: 1, icon_url: 1 },
                slots: 1,
                minFee: 1,
                maxFee: 1,
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
        avatar_url: doc.user?.avatar_url || doc.doctor_avatar_url || null,
        workplace: doc.workplace ?? null,
        rating: doc.rating ?? null,
        clinic: doc.clinic
            ? {
                id: String(doc.clinic._id),
                name: doc.clinic.name,
                address: doc.clinic.address?.fullAddress || null,
            }
            : null,
        specialties: (doc.specialties || []).map((s) => ({
            id: String(s._id),
            name: s.name,
            icon_url: s.icon_url || null,
        })),
        pricing: {
            minFee: doc.minFee ?? null,
            maxFee: doc.maxFee ?? null,
            currency: "VND",
        },
        slots: doc.slots || [],
    };
}

module.exports = { getDoctorDetailFull };
