const Doctor = require("../../model/doctor/Doctor");
const Clinic = require("../../model/clinic/Clinic");

async function getTopDoctors({ limit, provinceCode, wardCode }) {
    const doctorFilter = { rating: { $ne: null } };

    if (provinceCode || wardCode) {
        const clinicFilter = {};
        if (provinceCode) clinicFilter["address.province.code"] = String(provinceCode);
        if (wardCode) clinicFilter["address.ward.code"] = String(wardCode);

        const clinics = await Clinic.find(clinicFilter).select("_id").lean();
        const clinicIds = clinics.map(c => c._id);

        if (clinicIds.length === 0) {
            return [];
        }

        doctorFilter.clinic_id = { $in: clinicIds };
    }

    let query = Doctor.find(doctorFilter)
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
