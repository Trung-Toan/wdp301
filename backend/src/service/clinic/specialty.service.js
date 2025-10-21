const Specialty = require("../../model/clinic/Specialty");

async function getAllSpecialties({ status, q } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (q) {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ name: rx }, { description: rx }];
    }

    const specialties = await Specialty.find(filter)
        .sort({ name: 1 })
        .select("_id name description icon_url status") 
        .lean();

    return specialties.map((s) => ({
        id: s._id,
        name: s.name,
        description: s.description,
        icon_url: s.icon_url,
        status: s.status,
    }));
}

module.exports = { getAllSpecialties };
