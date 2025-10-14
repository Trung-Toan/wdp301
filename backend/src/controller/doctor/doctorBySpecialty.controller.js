const { searchDoctorsBySpecialty } = require("../../service/doctor/doctorBySpecialty.service");

async function getDoctorsBySpecialty(req, res) {
    try {
        const { specialtyId, q, page, limit, sort } = req.query;

        const result = await searchDoctorsBySpecialty({
            specialtyId,
            q,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            sort,
        });

        return res.json(result);
    } catch (err) {
        console.error("getDoctorsBySpecialty error:", err);
        return res.status(500).json({ message: "Server error", details: err.message });
    }
}

module.exports = { getDoctorsBySpecialty };
