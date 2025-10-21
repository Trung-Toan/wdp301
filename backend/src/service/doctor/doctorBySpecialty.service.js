const mongoose = require("mongoose");
const Doctor = require("../../model/doctor/Doctor");

async function searchDoctorsBySpecialty({
    specialtyId,
    q,
    page = 1,
    limit = 20,
    sort = "-createdAt",
}) {
    if (!specialtyId) {
        return { meta: { page: +page, limit: +limit, total: 0, totalPages: 1 }, items: [] };
    }

    const specObjId = new mongoose.Types.ObjectId(String(specialtyId));
    const skip = (Number(page) - 1) * Number(limit);

    const sortObj = {};
    String(sort)
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(f => (f[0] === "-" ? (sortObj[f.slice(1)] = -1) : (sortObj[f] = 1)));

    const filter = { specialty_id: specObjId };
    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ title: rx }, { degree: rx }, { description: rx }, { experience: rx }];
    }

    const [items, total] = await Promise.all([
        Doctor.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit))
            .populate({
                path: "clinic_id",
                select: "name address",
                model: "Clinic",
            })
            .select("title degree description experience user_id clinic_id specialty_id createdAt")
            .lean(),
        Doctor.countDocuments(filter),
    ]);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)) || 1,
        },
        items: items.map(d => ({
            _id: d._id,
            title: d.title,
            degree: d.degree,
            description: d.description,
            experience: d.experience,
            specialty_id: d.specialty_id,
            user_id: d.user_id,
            clinic: d.clinic_id
                ? {
                    _id: d.clinic_id._id,
                    name: d.clinic_id.name,
                    address: d.clinic_id.address,
                }
                : null,
            createdAt: d.createdAt,
        })),
    };
}

module.exports = { searchDoctorsBySpecialty };
