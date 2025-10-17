const MedicalRecord = require("../../model/patient/MedicalRecord");
const patientService = require("../../service/patient/patient.service");

const ok = (res, data) => res.status(200).json({ success: true, data });
const fail = (res, err, status = 500) => res.status(status).json({ success: false, error: err?.message || String(err) });

exports.listMyRecords = async (req, res) => {
    try {
        let patientId = req.params.patientId;
        if (!patientId) {
            const accountId = req.user?.sub;
            const patient = await patientService.findPatientByAccountId(accountId);
            patientId = patient?._id;
        }
        if (!patientId) {
            return fail(res, new Error("Patient not found for current account"), 404);
        }
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            MedicalRecord.find({ patient_id: patientId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            MedicalRecord.countDocuments({ patient_id: patientId })
        ]);

        return ok(res, { items, page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) || 1 });
    } catch (err) { return fail(res, err); }
};

exports.getRecordDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const rec = await MedicalRecord.findById(id).lean();
        if (!rec) return fail(res, new Error("Record not found"), 404);
        return ok(res, rec);
    } catch (err) { return fail(res, err); }
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
        const { id, requestId } = req.params; // record id, access request index or id
        const { action } = req.body; // APPROVE or REJECT
        const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

        const rec = await MedicalRecord.findById(id);
        if (!rec) return fail(res, new Error("Record not found"), 404);
        const reqItem = rec.access_requests.id?.(requestId) || rec.access_requests[requestId];
        if (!reqItem) return fail(res, new Error("Access request not found"), 404);
        reqItem.status = status;
        if (status === 'APPROVED') reqItem.approved_at = new Date();
        await rec.save();
        return ok(res, rec.toObject());
    } catch (err) { return fail(res, err); }
};


