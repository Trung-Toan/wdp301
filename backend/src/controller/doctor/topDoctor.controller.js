const { getTopDoctors } = require("../../service/doctor/topDoctor.service");

async function getTopDoctorsController(req, res) {
    try {
        const { limit } = req.query;
        const data = await getTopDoctors({ limit });
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
