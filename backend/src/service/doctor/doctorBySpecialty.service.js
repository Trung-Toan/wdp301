const mongoose = require("mongoose");
const Doctor = require("../../model/doctor/Doctor");
const License = require("../../model/clinic/License");

async function searchDoctorsBySpecialty({
    specialtyId,
    q,
    page = 1,
    limit = 10,
    sort = "-createdAt",
}) {
    if (!specialtyId) {
        return { meta: { page: +page, limit: +limit, total: 0, totalPages: 1 }, items: [] };
    }

    const specObjId = new mongoose.Types.ObjectId(String(specialtyId));
    const skip = (Number(page) - 1) * Number(limit);

    // Tạo đối tượng sort
    const sortObj = {};
    String(sort)
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(f => (f[0] === "-" ? (sortObj[f.slice(1)] = -1) : (sortObj[f] = 1)));

    // Bộ lọc tìm kiếm
    const filter = { specialty_id: specObjId };
    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ title: rx }, { degree: rx }, { description: rx }, { experience: rx }];
    }

    // Lấy danh sách bác sĩ + tổng số lượng
    const [doctors, total] = await Promise.all([
        Doctor.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit))
            .populate({
                path: "clinic_id",
                select: "name address",
                model: "Clinic",
            })
            .populate({
                path: "user_id",
                select: "full_name avatar_url",
                model: "User",
            })
            .populate({
                path: "specialty_id",
                select: "name",
                model: "Specialty",
            })
            .select("title degree description experience user_id clinic_id specialty_id createdAt")
            .lean(),
        Doctor.countDocuments(filter),
    ]);

    // Lấy danh sách license hợp lệ (APPROVED)
    const doctorIds = doctors.map(d => d._id);
    const licenses = await License.find({
        doctor_id: { $in: doctorIds },
        status: "APPROVED", // chỉ lấy giấy phép hợp lệ
    })
        .select("doctor_id licenseNumber issued_by issued_date expiry_date status document_url")
        .lean();

    //  Gắn license vào từng bác sĩ tương ứng
    const items = doctors.map(d => ({
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
        licenses: licenses
            .filter(l => String(l.doctor_id) === String(d._id))
            .map(l => ({
                licenseNumber: l.licenseNumber,
                issued_by: l.issued_by,
                issued_date: l.issued_date,
                expiry_date: l.expiry_date,
                status: l.status,
                document_url: l.document_url,
            })),
        createdAt: d.createdAt,
    }));

    // Nếu muốn: chỉ hiển thị bác sĩ có ít nhất 1 license hợp lệ
    const filteredItems = items.filter(d => d.licenses.length > 0);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total: filteredItems.length,
            totalPages: Math.ceil(filteredItems.length / Number(limit)) || 1,
        },
        items: filteredItems,
    };
}

module.exports = { searchDoctorsBySpecialty };
