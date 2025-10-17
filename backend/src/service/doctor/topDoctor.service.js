const Doctor = require("../../model/doctor/Doctor");

async function getTopDoctors({ limit }) {
    let query = Doctor.find({ rating: { $ne: null } })
        .sort({ rating: -1, createdAt: -1 })
        .populate({
            path: "clinic_id",
            select: "name address",
            model: "Clinic",
        })
        .populate({
            path: "specialty_id",
            select: "name",
            model: "Specialty",
        })
        .select("title degree workplace rating avatar_url specialty_id clinic_id createdAt")
        .lean();

    // Chỉ giới hạn nếu có limit > 0
    if (limit && Number(limit) > 0) {
        query = query.limit(Number(limit));
    }

    const doctors = await query;

    return doctors.map(d => ({
        _id: d._id,
        title: d.title,
        degree: d.degree,
        workplace: d.workplace,
        rating: d.rating,
        avatar_url: d.avatar_url,
        specialties: d.specialty_id
            ? d.specialty_id.map(s => ({ _id: s._id, name: s.name }))
            : [],
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
