const Patient = require('../../model/patient/Patient');
const userService = require("../user/user.service");


exports.getPatientById = async (req) => {
    try {
        const patientId = req.params.patientId;
        const patients = await Patient.findById(patientId)
            .select('-__v -createdAt -updatedAt')
            .populate({
                path: 'user_id',
                select: "-__v -createdAt -updatedAt -address ",
                populate: {
                    path: 'account_id',
                    select: '_id email email phone_number'
                }
            })
            .lean();
        const patient = patients ? {
            patient_id: patients._id,
            user_id: patients.user_id._id,
            patient_code: patients.patient_code,
            full_name: patients.user_id.full_name,
            dob: patients.user_id.dob,
            gender: patients.user_id.gender,
            avatar_url: patients.user_id.avatar_url,
            email: patients.user_id.account_id.email,
            phone_number: patients.user_id.account_id.phone_number,
            blood_type: patients.blood_type,
            allergies: patients.allergies,
            chronic_diseases: patients.chronic_diseases,
            medications: patients.medications,
            surgery_history: patients.surgery_history,
        } : null;
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



