const Doctor = require("../../model/doctor/Doctor");
const Clinic = require("../../model/clinic/Clinic");

async function getTopDoctors({ limit, provinceCode, wardCode }) {
    const doctorFilter = {};

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
        .sort({ createdAt: -1 })
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
        .select("title degree description experience specialty_id clinic_id user_id createdAt")
        .lean();

    if (limit && Number(limit) > 0) {
        query = query.limit(Number(limit));
    }

    const doctors = await query;

    return doctors.map(d => ({
        _id: d._id,
        title: d.title,
        degree: d.degree,
        description: d.description,
        experience: d.experience,
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
