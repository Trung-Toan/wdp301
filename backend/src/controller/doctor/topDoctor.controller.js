const { getTopDoctors } = require("../../service/doctor/topDoctor.service");
const patientService = require("../../service/patient/patient.service");

async function getTopDoctorsController(req, res) {
    try {
        const { limit, provinceCode, wardCode } = req.query;

        const data = await getTopDoctors({ limit, provinceCode, wardCode });
        return res.json({
            success: true,
            total: data.length,
            data,
        });
    } catch (err) {
        console.error("getTopDoctors error:", err);
        return res.status(500).json({ message: "Server error", details: err.message });
    }
}

module.exports = { getTopDoctorsController };

async function getTopDoctorsNearMeController(req, res) {
    try {
        const { limit } = req.query;

        const accountId = req.user?.sub;

        if (!accountId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const patient = await patientService.findPatientByAccountId(accountId);
        if (!patient || (!patient.province_code && !patient.ward_code)) {
            return res.status(400).json({ success: false, message: "Missing patient location. Please set province and ward." });
        }

        const data = await getTopDoctors({
            limit,
            provinceCode: patient.province_code,
            wardCode: patient.ward_code,
        });

        return res.json({ success: true, total: data.length, data });
    } catch (err) {
        console.error("getTopDoctorsNearMe error:", err);
        return res.status(500).json({ message: "Server error", details: err.message });
    }
}

module.exports.getTopDoctorsNearMeController = getTopDoctorsNearMeController;
