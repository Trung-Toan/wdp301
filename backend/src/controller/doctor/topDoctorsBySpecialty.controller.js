const {
    getTopDoctorsBySpecialty,
    getTopDoctorsBySingleSpecialty
} = require("../../service/doctor/topDoctorsBySpecialty.service");

/**
 * Controller để lấy top bác sĩ được book nhiều nhất theo từng chuyên ngành
 */
async function getTopDoctorsBySpecialtyController(req, res) {
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

        const data = await getTopDoctorsBySpecialty({
            limit: limitNumber,
            statuses: parsedStatuses
        });

        return res.json({
            success: true,
            totalSpecialties: data.length,
            totalDoctors: data.reduce((sum, item) => sum + item.doctors.length, 0),
            data
        });
    } catch (err) {
        console.error("getTopDoctorsBySpecialtyController error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            details: err.message
        });
    }
}

/**
 * Controller để lấy top bác sĩ được book nhiều nhất cho một chuyên ngành cụ thể
 */
async function getTopDoctorsBySingleSpecialtyController(req, res) {
    try {
        const { specialtyId } = req.params;
        const { limit = 10, statuses } = req.query;

        if (!specialtyId) {
            return res.status(400).json({
                success: false,
                message: "Specialty ID is required"
            });
        }

        // Parse statuses nếu có
        let parsedStatuses = ['SCHEDULED', 'APPROVE', 'COMPLETED'];
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

        const data = await getTopDoctorsBySingleSpecialty(specialtyId, {
            limit: limitNumber,
            statuses: parsedStatuses
        });

        if (!data.specialty) {
            return res.status(404).json({
                success: false,
                message: "Specialty not found"
            });
        }

        return res.json({
            success: true,
            total: data.doctors.length,
            data
        });
    } catch (err) {
        console.error("getTopDoctorsBySingleSpecialtyController error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            details: err.message
        });
    }
}

module.exports = {
    getTopDoctorsBySpecialtyController,
    getTopDoctorsBySingleSpecialtyController
};

