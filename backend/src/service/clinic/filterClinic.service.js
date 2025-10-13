const Clinic = require("../../model/clinic/Clinic");
const Specialty = require("../../model/clinic/Specialty");

async function searchClinics({ provinceCode, wardCode, specialtyId, q, page = 1, limit = 20, sort = "-createdAt" }) {
    const and = [];

    if (provinceCode) {
        and.push({ $or: [{ provinceCode }, { "address.province.code": provinceCode }] });
    }

    if (wardCode) {
        and.push({ $or: [{ wardCode }, { "address.ward.code": wardCode }] });
    }

    if (specialtyId) {
        and.push({
            $or: [
                { specialties: { $in: [specialtyId] } },
                { "specialties._id": specialtyId },
                { "specialties.specialtyId": specialtyId },
            ],
        });
    }

    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), "i");
        and.push({ $or: [{ name: rx }, { shortName: rx }, { description: rx }] });
    }

    const filter = and.length ? { $and: and } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
        Clinic.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate({ path: "specialties", select: "name icon_url status", model: Specialty })
            .select("name shortName logo_url status specialties address provinceCode wardCode createdAt")
            .lean(),
        Clinic.countDocuments(filter),
    ]);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)) || 1,
        },
        items,
    };
}

module.exports = { searchClinics };
