const complaintService = require("../../service/patient/complaint.service");
const patientService = require("../../service/patient/patient.service");

/**
 * Tạo khiếu nại mới
 */
exports.createComplaint = async (req, res, next) => {
    try {
        const accountId = req.user?.sub;
        if (!accountId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Lấy patient từ accountId
        const patient = await patientService.findPatientByAccountId(accountId);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bệnh nhân" });
        }

        const complaint = await complaintService.createComplaint(patient._id, req.body);

        return res.json({
            success: true,
            message: "Gửi khiếu nại thành công",
            data: complaint,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Lấy danh sách khiếu nại của bệnh nhân
 */
exports.getPatientComplaints = async (req, res, next) => {
    try {
        const accountId = req.user?.sub;
        if (!accountId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Lấy patient từ accountId
        const patient = await patientService.findPatientByAccountId(accountId);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bệnh nhân" });
        }

        const { page, limit, status, complaint_type } = req.query;

        const result = await complaintService.getPatientComplaints(patient._id, {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            status,
            complaint_type,
        });

        return res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Lấy chi tiết khiếu nại
 */
exports.getComplaintById = async (req, res, next) => {
    try {
        const accountId = req.user?.sub;
        if (!accountId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Lấy patient từ accountId
        const patient = await patientService.findPatientByAccountId(accountId);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Không tìm thấy bệnh nhân" });
        }

        const { complaintId } = req.params;

        const complaint = await complaintService.getComplaintById(complaintId, patient._id);

        return res.json({
            success: true,
            data: complaint,
        });
    } catch (error) {
        return next(error);
    }
};

