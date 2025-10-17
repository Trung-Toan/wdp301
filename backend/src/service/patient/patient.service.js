const Patient = require('../../model/patient/Patient');
const userService = require("../user/user.service");


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


exports.getPatientByCode = async (req) => {
    try {
        const { patientCode } = req.params;
        const patient = await Patient.findOne({ patient_code: patientCode }).lean();
        return { patient };
    } catch (error) {
        console.error("Lỗi khi tìm bác sĩ bằng user_id:", error);
        return null;
    }
};

exports.findPatientByUserId = async (userId) => {
    try {
        const patient = await Patient.findOne({ user_id: userId }).lean();
        return patient || null;
    } catch (error) {
        console.error("Lỗi khi tìm bác sĩ bằng user_id:", error);
        return null;
    }
};

exports.findPatientByAccountId = async (accountId) => {
    try {
        const user = await userService.findUserByAccountId(accountId);
        if (!user) {
            return null;
        }
        const patient = await exports.findPatientByUserId(user._id);
        return patient || null;
    } catch (error) {
        console.error("Lỗi khi tìm user bằng accountId:", error);
        return null;
    }
}

/**
 * Update patient location (province_code, ward_code) by account id
 */
exports.updatePatientLocationByAccountId = async (accountId, { province_code, ward_code }) => {
    const user = await userService.findUserByAccountId(accountId);
    if (!user) {
        throw new Error('User not found');
    }

    const patient = await Patient.findOneAndUpdate(
        { user_id: user._id },
        { $set: { province_code, ward_code } },
        { new: true }
    ).lean();

    if (!patient) {
        throw new Error('Patient not found');
    }

    return patient;
}



