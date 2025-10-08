const Patient = require('../../model/patient/Patient');

/**
 * get patient by id
 * @param {*} req 
 * @returns 
 */
exports.getPatientById = async (req) => {
    try {
        const patientId = req.params.patientId;
        const patient = await Patient.findById(patientId).lean();
        return { patient };
    } catch (error) {
        console.error("Lỗi khi tìm bác sĩ bằng user_id:", error);
        return null;
    }
};

/**
 * get patient by code
 * @param {*} req 
 * @returns 
 */
exports.getPatientByCode = async (req) => {
    try {
        const {patientCode} = req.params;
        const patient = await Patient.findOne({patient_code: patientCode}).lean();
        return { patient };
    } catch (error) {
        console.error("Lỗi khi tìm bác sĩ bằng user_id:", error);
        return null;
    }
};


