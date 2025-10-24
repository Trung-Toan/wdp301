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

        // Lookup User
        { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },

        // Lookup Clinic
        { $lookup: { from: "clinics", localField: "clinic_id", foreignField: "_id", as: "clinic" } },
        { $unwind: { path: "$clinic", preserveNullAndEmptyArrays: true } },

        // Lookup Specialty
        { $lookup: { from: "specialties", localField: "specialty_id", foreignField: "_id", as: "specialties" } },

        // Lookup Licenses
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
        
        // Lookup Slots
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

        {
            $addFields: {
                minFee: { $min: "$slots.fee_amount" },
                maxFee: { $max: "$slots.fee_amount" },
            },
        },

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
                slots: 1,
                minFee: 1,
                maxFee: 1,
            },
        },
    ];

    const [doc] = await Doctor.aggregate(pipeline).allowDiskUse(true);
    if (!doc) return null;

    // Đưa dữ liệu ra ở dạng gọn gàng hơn
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
                address: doc.clinic.address?.fullAddress || null,
            }
            : null,
        specialties: (doc.specialties || []).map((s) => ({
            id: String(s._id),
            name: s.name,
            icon_url: s.icon_url || null,
        })),
        licenses: (doc.licenses).map((l) => ({
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
        pricing: {
            minFee: doc.minFee ?? null,
            maxFee: doc.maxFee ?? null,
            currency: "VND",
        },
        slots: doc.slots || [],
    };
}

module.exports = { getDoctorDetailFull };
