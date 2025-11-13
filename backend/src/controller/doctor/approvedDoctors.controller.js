const { getApprovedDoctors } = require("../../service/doctor/approvedDoctors.service");

/**
 * Controller để lấy danh sách tất cả bác sĩ có bằng cấp đã được duyệt
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getApprovedDoctorsController(req, res) {
    try {
        const { limit, provinceCode } = req.query;

        const data = await getApprovedDoctors({ limit, provinceCode });

        return res.json({
            success: true,
            total: data.length,
            data,
        });
    } catch (err) {
        console.error("getApprovedDoctors error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            details: err.message,
        });
    }
}

module.exports = { getApprovedDoctorsController };

