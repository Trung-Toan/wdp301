// src/service/doctor/topDoctor.service.js
const Doctor = require("../../model/doctor/Doctor");

async function getTopDoctors({ limit = 5 }) {
    const doctors = await Doctor.find({ rating: { $ne: null } })
        .sort({ rating: -1, createdAt: -1 })
        .limit(Number(limit))
        .populate({
            path: "clinic_id",
            select: "name address",
            model: "Clinic",
        })
        .select("title degree workplace rating avatar_url specialty_id clinic_id createdAt")
        .lean();

    return doctors.map(d => ({
        _id: d._id,
        title: d.title,
        degree: d.degree,
        workplace: d.workplace,
        rating: d.rating,
        avatar_url: d.avatar_url,
        specialties: d.specialty_id,
        clinic: d.clinic_id
            ? {
                _id: d.clinic_id._id,
                name: d.clinic_id.name,
                address: d.clinic_id.address,
            }
            : null,
        createdAt: d.createdAt,
    }));
}

module.exports = { getTopDoctors };
