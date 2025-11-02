const { getTopClinics } = require("../../service/clinic/topClinics.service");

/**
 * Controller để lấy top phòng khám được book nhiều nhất
 */
async function getTopClinicsController(req, res) {
    try {
        const { limit = 10, statuses } = req.query;

        // Parse statuses nếu có (ví dụ: "SCHEDULED,APPROVE,COMPLETED")
        let parsedStatuses = ['SCHEDULED', 'APPROVE', 'COMPLETED']; // Default
        if (statuses) {
            parsedStatuses = typeof statuses === 'string'
                ? statuses.split(',').map(s => s.trim())
                : Array.isArray(statuses) ? statuses : parsedStatuses;
        }

        const limitNumber = parseInt(limit, 10);

        if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }

        const data = await getTopClinics({
            limit: limitNumber,
            statuses: parsedStatuses
        });

        return res.json({
            success: true,
            total: data.length,
            data
        });
    } catch (err) {
        console.error("getTopClinicsController error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            details: err.message
        });
    }
}

module.exports = {
    getTopClinicsController
};
