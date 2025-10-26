const patientService = require("../../service/patient/patient.service");

async function setLocation(req, res) {
    try {
        const accountId = req.user?.sub;
        if (!accountId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { province_code, ward_code } = req.body || {};
        if (!province_code) {
            return res.status(400).json({ success: false, message: "province_code is required" });
        }

        const updated = await patientService.updatePatientLocationByAccountId(accountId, { province_code, ward_code: ward_code || null });
        return res.json({ success: true, data: { province_code: updated.province_code, ward_code: updated.ward_code } });
    } catch (err) {
        const msg = err?.message || String(err);
        if (/User not found|Patient not found/.test(msg)) {
            return res.status(404).json({ success: false, message: msg });
        }
        console.error("setLocation error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { setLocation };


