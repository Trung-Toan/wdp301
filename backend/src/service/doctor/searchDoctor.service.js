const mongoose = require("mongoose");
const Doctor = require("../../model/doctor/Doctor");

async function searchDoctors({
    q,
    clinicId,
    specialtyId,
    provinceCode,
    wardCode,
    page = 1,
    limit = 20,
    sort = "-createdAt",
}) {
    const toObjectId = (id) =>
        mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

    const pipeline = [];

    // Join các bảng liên quan trước để có thể match theo tên
    pipeline.push(
        { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $lookup: { from: "clinics", localField: "clinic_id", foreignField: "_id", as: "clinic" } },
        { $unwind: { path: "$clinic", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "specialties", localField: "specialty_id", foreignField: "_id", as: "specialties" } }
    );

    const and = [];

    // Lọc theo phòng khám: ID hoặc tên
    if (clinicId) {
        const cid = toObjectId(clinicId);
        if (cid) and.push({ clinic_id: cid });
        else and.push({ "clinic.name": new RegExp(String(clinicId).trim(), "i") });
    }

    // Lọc theo chuyên khoa: ID hoặc tên
    if (specialtyId) {
        const sid = toObjectId(specialtyId);
        if (sid) and.push({ specialty_id: { $in: [sid] } });
        else and.push({ "specialties.name": new RegExp(String(specialtyId).trim(), "i") });
    }

    // Lọc theo địa chỉ phòng khám
    if (provinceCode) and.push({ "clinic.address.province.code": String(provinceCode) });
    if (wardCode) and.push({ "clinic.address.ward.code": String(wardCode) });

    // Tìm kiếm tổng hợp theo q
    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), "i");
        and.push({
            $or: [
                { "user.full_name": rx },   // tên bác sĩ
                { "clinic.name": rx },      // tên phòng khám
                { "specialties.name": rx }, // tên chuyên khoa
                { title: rx },
                { degree: rx },
                { description: rx },
                { experience: rx },
            ],
        });
    }

    if (and.length) pipeline.push({ $match: { $and: and } });

    // Sort whitelist
    const sortMap = {
        createdAt: { createdAt: 1 },
        "-createdAt": { createdAt: -1 },
        full_name: { "user.full_name": 1 },
        "-full_name": { "user.full_name": -1 },
    };
    const sortStage = sortMap[sort] || { createdAt: -1 };

    // Pagination
    const skip = Math.max(0, (Number(page) - 1) * Number(limit));
    const take = Math.max(1, Math.min(100, Number(limit)));

    pipeline.push({
        $facet: {
            data: [
                { $sort: sortStage },
                { $skip: skip },
                { $limit: take },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        degree: 1,
                        description: 1,
                        experience: 1,
                        clinic_id: 1,
                        specialty_id: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        user: { _id: 1, full_name: 1, avatar_url: 1 },
                        clinic: { _id: 1, name: 1, address: 1, status: 1 },
                        specialties: { _id: 1, name: 1, status: 1, icon_url: 1 },
                    },
                },
            ],
            meta: [{ $count: "total" }],
        },
    });

    const [result] = await Doctor.aggregate(pipeline).allowDiskUse(true);
    const data = result?.data ?? [];
    const total = result?.meta?.[0]?.total ?? 0;

    return {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit || 1)) || 0,
        items: data,
    };
}

module.exports = { searchDoctors }; 
