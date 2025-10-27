const mongoose = require("mongoose");
const Specialty = require("../../model/clinic/Specialty");

// Lấy tất cả chuyên khoa
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

// Lấy chuyên khoa theo ID
async function getSpecialtyById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid specialty ID");
    }

    const specialty = await Specialty.findById(id)
        .select("_id name description icon_url status")
        .lean();

    if (!specialty) {
        throw new Error("Không tìm thấy chuyên khoa");
    }

    return {
        id: specialty._id,
        name: specialty.name,
        description: specialty.description,
        icon_url: specialty.icon_url,
        status: specialty.status,
    };
}

module.exports = { getAllSpecialties, getSpecialtyById };
