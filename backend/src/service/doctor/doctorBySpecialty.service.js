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

    // Bước 1: Lấy danh sách doctor_id có license APPROVED
    const approvedLicenses = await License.find({
        status: "APPROVED",
    })
        .select("doctor_id")
        .lean();
    
    const approvedDoctorIds = [...new Set(approvedLicenses.map(l => String(l.doctor_id)))];
    
    if (approvedDoctorIds.length === 0) {
        return {
            meta: {
                page: Number(page),
                limit: Number(limit),
                total: 0,
                totalPages: 1,
            },
            items: [],
        };
    }

    // Bước 2: Bộ lọc tìm kiếm - chỉ lấy bác sĩ có license APPROVED
    const filter = {
        specialty_id: specObjId,
        _id: { $in: approvedDoctorIds.map(id => new mongoose.Types.ObjectId(id)) },
    };
    
    if (q && q.trim()) {
        const rx = new RegExp(q.trim(), "i");
        filter.$or = [{ title: rx }, { degree: rx }, { description: rx }, { experience: rx }];
    }

    // Bước 3: Lấy danh sách bác sĩ + tổng số lượng (chỉ những bác sĩ có license APPROVED)
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

    // Bước 4: Lấy danh sách license hợp lệ (APPROVED) cho các bác sĩ đã query
    const doctorIds = doctors.map(d => d._id);
    const licenses = await License.find({
        doctor_id: { $in: doctorIds },
        status: "APPROVED",
    })
        .select("doctor_id licenseNumber issued_by issued_date expiry_date status document_url")
        .lean();

    // Bước 5: Gắn license vào từng bác sĩ tương ứng
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

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total: total,
            totalPages: Math.ceil(total / Number(limit)) || 1,
        },
        items: items,
    };
}

module.exports = { searchDoctorsBySpecialty };
