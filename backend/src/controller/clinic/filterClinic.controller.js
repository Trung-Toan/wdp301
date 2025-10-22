const { searchClinics } = require("../../service/clinic/filterClinic.service");

async function getClinicsByFilters(req, res) {
    try {
        const { provinceCode, wardCode, specialtyId, q, page, limit, sort } = req.query;

        const result = await searchClinics({
            provinceCode,
            wardCode,
            specialtyId,
            q,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            sort,
        });

        return res.json(result);
    } catch (err) {
        console.error("getClinicsByFilters error:", err);
        return res.status(500).json({ message: "Server error", details: err.message });
    }
}

module.exports = { getClinicsByFilters };
