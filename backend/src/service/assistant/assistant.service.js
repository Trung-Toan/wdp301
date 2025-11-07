const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");
const Assistant = require("../../model/user/Assistant");
const patientService = require("../../service/patient/patient.service");
const MedicalRecord = require("../../model/patient/MedicalRecord");
const Appointment = require("../../model/appointment/Appointment");
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

exports.getAssistantByAccountIdPopulate = async (accountId) => {
    try {
        const user = await User.findOne({ account_id: accountId }).lean();

        if (!user) {
            return null;
        }
        const assistant = await Assistant.findOne({ user_id: user._id })
            .populate({
                path: 'doctor_id', 
                select: '-__v -createdAt -updatedAt', 
                populate: {
                    path: 'user_id', 
                    select: "-__v -createdAt -updatedAt -notify_marketing "
                }
            })
            .populate({
                path: "clinic_id", 
                select: "name phone email logo_url banner_url address specialties"
            })
            .lean();
        return assistant || null;
    } catch (error) {
        console.error("Lỗi khi tìm trợ lý bằng accountId:", error);
        return null;
    }
};

exports.getUserByAccountId = async (accountId) => {
    try {
        const user = await User.findOne({ account_id: accountId }).lean();
        return user || null;
    } catch (error) {
        console.error("Lỗi khi tìm user bằng accountId:", error);
        return null;
    }
};

exports.getAccountById = async (accountId) => {
    try {
        const account = await Account.findById(accountId).lean();
        return account || null;
    } catch (error) {
        console.error("Lỗi khi tìm account bằng accountId:", error);
        return null;
    }
};

exports.getListPatients = async (req) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const accountId = req.user.sub;
        const assistant = await exports.getAssistantByAccountId(accountId);
        if (!assistant) throw new Error('Truy cập bị từ chối: Không tìm thấy trợ lý.');

        return await patientService.getPatientAvailableOfDoctor(assistant.doctor_id, page, limit, search);
    } catch (error) {
        throw error;
    }

};

exports.getMedicalRecordOfAssistant = async (ass_id, page, limit, slot, status) => {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const skip = (page - 1) * limit;

    const matchAppointmentCondition = { slot_id: slot };

    try {
        // Lấy danh sách appointment hợp lệ
        const apps = await Appointment.find(matchAppointmentCondition).select("_id");
        const appointmentIds = apps.map(a => a._id);
        const filter = {
            created_by: ass_id,
            appointment_id: { $in: appointmentIds },
            ...(status && { status })
        };
        const [data, total] = await Promise.all([
            MedicalRecord.find(filter)
                .populate("appointment_id")
                .skip(skip)
                .limit(limit),
            MedicalRecord.countDocuments(filter)
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                totalItem: total,
                totalPage: Math.ceil(total / limit)
            }
        };

    } catch (error) {
        console.log(`Lỗi tại getMedicalRecordOfAssistant(${ass_id}): `, error);
        throw error;
    }
};

exports.changePassword = async (id, currentPassword, newPassword) => {
    try {
        const account = await Account.findById(id);
        if (!account) {
            throw new Error('Không tìm thấy tài khoản.');
        }

        const isMatch = await bcrypt.compare(currentPassword, account.password);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không đúng.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        account.password = hashedPassword;

        const updated = await account.save();

        return updated;

    } catch (err) {
        console.log(`Lỗi tại changePassword(${id}): `, err);
        throw err;
    }
}
