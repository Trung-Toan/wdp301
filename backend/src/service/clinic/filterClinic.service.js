const Clinic = require("../../model/clinic/Clinic");
const Specialty = require("../../model/clinic/Specialty");

async function searchClinics({ provinceCode, wardCode, specialtyId, q, page = 1, limit = 20, sort = "-createdAt" }) {
    const and = [];

    // Filter by province - only check address.province.code
    if (provinceCode) {
        and.push({ "address.province.code": provinceCode });
    }

    // Filter by ward - only check address.ward.code
    if (wardCode) {
        and.push({ "address.ward.code": wardCode });
    }

    // Filter by specialty - check if specialty is in the array
    if (specialtyId) {
        and.push({ specialties: { $in: [specialtyId] } });
    }

    // Search by query string
    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), "i");
        and.push({ $or: [{ name: rx }, { description: rx }] });
    }
    const filter = and.length ? { $and: and } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
        Clinic.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate({ path: "specialties", select: "name icon_url status", model: Specialty })
            .select("name description logo_url status specialties address phone email website")
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
