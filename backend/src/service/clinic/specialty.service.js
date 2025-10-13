const Specialty = require("../../model/clinic/Specialty");

async function getAllSpecialties({ status, q } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (q) {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ name: rx }, { description: rx }];
    }

    return Specialty.find(filter)
        .sort({ name: 1 })
        .select("name description icon_url status -_id")
        .lean();
}

module.exports = { getAllSpecialties };
