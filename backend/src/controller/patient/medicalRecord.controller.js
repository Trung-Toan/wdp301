const MedicalRecord = require("../../model/patient/MedicalRecord");
const patientService = require("../../service/patient/patient.service");

const ok = (res, data) => res.status(200).json({ success: true, data });

const fail = (res, err, status = 500) => res.status(status).json({ success: false, error: err?.message || String(err) });

function pickDoctorName(doc) {
    if (!doc) return undefined;

    return doc.full_name || doc?.user_id?.full_name;
}

exports.listMyRecords = async (req, res) => {
    try {
        let patientId = req.params.patientId;

        if (!patientId) {
            const accountId = req.user?.sub;
            const patient = await patientService.findPatientByAccountId(accountId);
            patientId = patient?._id;
        }

        if (!patientId) {
            return res.status(404).json({ success: false, error: "Patient not found for current account" });
        }

        const { page = 1, limit = 5 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [rawItems, total] = await Promise.all([
            MedicalRecord.find({ patient_id: patientId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate({
                    path: "doctor_id",
                    select: "title degree specialty_id user_id clinic_id",
                    populate: [
                        {
                            path: "user_id",
                            select: "full_name avatar_url"
                        },
                        {
                            path: "specialty_id",
                            select: "name description"
                        },
                        {
                            path: "clinic_id",
                            select: "name address phone"
                        }
                    ]
                })
                .lean(),
            MedicalRecord.countDocuments({ patient_id: patientId }),
        ]);

        // Populate doctor_id trong access_requests sau khi query
        const Doctor = require("../../model/doctor/Doctor");
        const items = await Promise.all(rawItems.map(async (r) => {
            // Populate doctor_id trong access_requests
            if (r.access_requests && r.access_requests.length > 0) {
                r.access_requests = await Promise.all(r.access_requests.map(async (req) => {
                    // Kiểm tra và populate doctor_id
                    if (req.doctor_id) {
                        let doctorId = null;
                        
                        // Xác định doctorId
                        if (typeof req.doctor_id === 'string') {
                            doctorId = req.doctor_id;
                        } else if (req.doctor_id && req.doctor_id.toString) {
                            doctorId = req.doctor_id.toString();
                        } else if (typeof req.doctor_id === 'object' && req.doctor_id._id) {
                            doctorId = req.doctor_id._id.toString();
                        }
                        
                        // Populate doctor nếu có doctorId
                        if (doctorId) {
                            const doctor = await Doctor.findById(doctorId)
                                .populate({
                                    path: "user_id",
                                    select: "full_name avatar_url"
                                })
                                .populate({
                                    path: "specialty_id",
                                    select: "name description"
                                })
                                .populate({
                                    path: "clinic_id",
                                    select: "name address phone"
                                })
                                .lean();
                            
                            if (doctor) {
                                // Đảm bảo serialize đúng bằng cách convert ObjectId thành string
                                req.doctor_id = {
                                    ...doctor,
                                    _id: doctor._id?.toString() || doctor._id,
                                    user_id: doctor.user_id ? {
                                        ...doctor.user_id,
                                        _id: doctor.user_id._id?.toString() || doctor.user_id._id,
                                        avatar_url: doctor.user_id.avatar_url
                                    } : doctor.user_id,
                                    specialty_id: Array.isArray(doctor.specialty_id) 
                                        ? doctor.specialty_id.map(s => ({
                                            ...s,
                                            _id: s._id?.toString() || s._id
                                        }))
                                        : doctor.specialty_id,
                                    clinic_id: doctor.clinic_id ? {
                                        ...doctor.clinic_id,
                                        _id: doctor.clinic_id._id?.toString() || doctor.clinic_id._id
                                    } : doctor.clinic_id
                                };
                            }
                        }
                    }
                    
                    return req;
                }));
            }

            return {
                ...r,
                doctor_name: r.doctor_id?.user_id?.full_name || "Chưa xác định",
                specialties: Array.isArray(r.doctor_id?.specialty_id) 
                    ? r.doctor_id.specialty_id.map(s => s.name || s) 
                    : (r.doctor_id?.specialty_id?.name ? [r.doctor_id.specialty_id.name] : []),
                clinic_name: r.doctor_id?.clinic_id?.name || "Chưa có cơ sở",
            };
        }));

        // Serialize để đảm bảo ObjectId được convert thành string
        const serializeItems = items.map(item => {
            // Deep clone và convert ObjectId
            const serialized = JSON.parse(JSON.stringify(item, (key, value) => {
                // Convert ObjectId thành string
                if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'ObjectId') {
                    return value.toString();
                }
                // Convert Date thành ISO string
                if (value instanceof Date) {
                    return value.toISOString();
                }
                return value;
            }));
            return serialized;
        });

        return res.status(200).json({
            success: true,
            data: {
                items: serializeItems,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)) || 1,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err?.message || String(err) });
    }
};

exports.getRecordDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const rec = await MedicalRecord.findById(id)
            .populate({
                path: "doctor_id",
                select: "title degree specialty_id user_id clinic_id",
                populate: [
                    { path: "user_id", select: "full_name avatar_url" },
                    { path: "specialty_id", select: "name description" },
                    { path: "clinic_id", select: "name address phone" }
                ]
            })
            .lean();

        if (!rec) return fail(res, new Error("Record not found"), 404);

        return ok(res, {
            ...rec,
            doctor_name: rec.doctor_id?.user_id?.full_name || "Chưa xác định",
            specialties: rec.doctor_id?.specialty_id?.map(s => s.name) || [],
            clinic_name: rec.doctor_id?.clinic_id?.name || "Chưa có cơ sở",
        });
    } catch (err) {
        return fail(res, err);
    }
};

exports.requestAccess = async (req, res) => {
    try {
        const { id } = req.params; // record id
        const { doctor_id } = req.body || {};
        const updated = await MedicalRecord.findByIdAndUpdate(id, { $push: { access_requests: { doctor_id, status: "PENDING", requested_at: new Date() } } }, { new: true }).lean();
        return ok(res, updated);
    } catch (err) { return fail(res, err); }
};

exports.updateAccessRequest = async (req, res) => {
    try {
        const { id, requestId } = req.params;

        const { action } = req.body;

        if (!action || !['APPROVE', 'REJECT'].includes(action)) {
            return fail(res, new Error("Invalid action. Must be 'APPROVE' or 'REJECT'"), 400);
        }

        const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

        const rec = await MedicalRecord.findById(id);

        if (!rec) return fail(res, new Error("Record not found"), 404);

        // Tìm access request bằng _id hoặc index
        let reqItem = null;
        
        // Nếu requestId có format "INDEX:X" (cho các request cũ không có _id)
        if (requestId.startsWith('INDEX:')) {
            const index = parseInt(requestId.replace('INDEX:', ''));
            if (!isNaN(index) && index >= 0 && index < rec.access_requests.length) {
                reqItem = rec.access_requests[index];
            }
        } else {
            // Thử tìm bằng _id (nếu là ObjectId)
            if (rec.access_requests.id) {
                reqItem = rec.access_requests.id(requestId);
            }
            
            // Nếu không tìm thấy, thử tìm bằng index (nếu requestId là số)
            if (!reqItem && !isNaN(requestId)) {
                const index = parseInt(requestId);
                if (index >= 0 && index < rec.access_requests.length) {
                    reqItem = rec.access_requests[index];
                }
            }
            
            // Nếu vẫn không tìm thấy, tìm bằng string comparison của _id
            if (!reqItem) {
                reqItem = rec.access_requests.find(req => 
                    req._id && req._id.toString() === requestId
                );
            }
        }

        if (!reqItem) return fail(res, new Error("Access request not found"), 404);
        
        // Đảm bảo reason không bị mất khi update
        if (!reqItem.reason) {
            reqItem.reason = "Yêu cầu truy cập hồ sơ bệnh án";
        }
        
        reqItem.status = status;

        if (status === 'APPROVED') reqItem.approved_at = new Date();

        // Đảm bảo tất cả các access requests khác cũng có reason để tránh validation error
        rec.access_requests.forEach((ar) => {
            if (!ar.reason) {
                ar.reason = "Yêu cầu truy cập hồ sơ bệnh án";
            }
        });

        await rec.save();
        return ok(res, rec.toObject());
    } catch (err) { 
        console.error("Error in updateAccessRequest:", err);
        return fail(res, err); 
    }
};


