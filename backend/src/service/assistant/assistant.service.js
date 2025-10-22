const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");
const Assistant = require("../../model/user/Assistant");
const patientService = require("../../service/patient/patient.service")

exports.getAssistantByAccountId = async (accountId) => {
    try {
        const user = await User.findOne({ account_id: accountId }).lean();
        if (!user) {
            return null;
        }
        const assistant = await Assistant.findOne({ user_id: user._id }).lean();
        return assistant || null;
    } catch (error) { 
        console.error("Lỗi khi tìm trợ lý bằng accountId:", error);
        return null;
    }
};

exports.getListPatients = async (req) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const accountId = req.user.sub;
        const assistant = await exports.getAssistantByAccountId(accountId);
        if (!assistant) throw new Error('Truy cập bị từ chối: Không tìm thấy trợ lý.');

        return await patientService.getPatientAvailableOfDoctor(assistant.doctor_id, parseInt(page), parseInt(limit), search);
    } catch (error) {
        throw error;
    }

};