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

        const items = rawItems.map(r => ({
            ...r,
            doctor_name: r.doctor_id?.user_id?.full_name || "Chưa xác định",
            specialties: r.doctor_id?.specialty_id?.map(s => s.name) || [],
            clinic_name: r.doctor_id?.clinic_id?.name || "Chưa có cơ sở",
        }));

        return res.status(200).json({
            success: true,
            data: {
                items,
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


