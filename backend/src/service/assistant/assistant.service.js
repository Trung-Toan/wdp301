const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");
const Assistant = require("../../model/user/Assistant");
const patientService = require("../../service/patient/patient.service");
const MedicalRecord = require("../../model/patient/MedicalRecord");
const Appointment = require("../../model/appointment/Appointment");
const mongoose = require("mongoose");


// ---- đã gửi trước: updateUserById (giữ nguyên) ----
const ALLOWED_USER_FIELDS = [
  "full_name","dob","gender","address","avatar_url",
  "notify_upcoming","notify_results","notify_marketing",
  "privacy_allow_doctor_view","privacy_share_with_providers",
];
const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return ["true","1","yes","on"].includes(v.toLowerCase());
  return false;
};
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

exports.updateUserById = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("UserId không hợp lệ");

  const src = updateData?.information && typeof updateData.information === "object"
    ? updateData.information
    : updateData || {};

  const payload = {};
  for (const key of ALLOWED_USER_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(src, key)) payload[key] = src[key];
  }

  if (Object.prototype.hasOwnProperty.call(payload, "dob")) {
    payload.dob = payload.dob ? new Date(payload.dob) : null;
  }

  ["notify_upcoming","notify_results","notify_marketing",
   "privacy_allow_doctor_view","privacy_share_with_providers"
  ].forEach((bKey) => {
    if (Object.prototype.hasOwnProperty.call(payload, bKey)) {
      payload[bKey] = toBool(payload[bKey]);
    }
  });

  if (Object.keys(payload).length === 0) {
    return await User.findById(id).lean();
  }

  const updated = await User.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true }).lean();
  if (!updated) throw new Error("Không tìm thấy người dùng để cập nhật");
  return updated;
};

const ALLOWED_ACCOUNT_FIELDS = ["username", "email", "phone_number"];
exports.updateAccountById = async (accountId, data) => {
  if (!mongoose.Types.ObjectId.isValid(accountId)) throw new Error("AccountId không hợp lệ");

  const payload = {};
  for (const key of ALLOWED_ACCOUNT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) payload[key] = data[key];
  }

  if (Object.keys(payload).length === 0) {
    return await Account.findById(accountId).lean();
  }

  const updated = await Account.findByIdAndUpdate(
    accountId,
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw new Error("Không tìm thấy tài khoản để cập nhật");
  return updated;
};

exports.updateAssistantById = async (assistantId, data) => {
  if (!mongoose.Types.ObjectId.isValid(assistantId)) throw new Error("AssistantId không hợp lệ");

  const payload = {};
  if (Object.prototype.hasOwnProperty.call(data, "note")) {
    payload.note = data.note;
  }

  // Không cập nhật type theo UI/Policy
  if (Object.keys(payload).length === 0) {
    return await Assistant.findById(assistantId).lean();
  }

  const updated = await Assistant.findByIdAndUpdate(
    assistantId,
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw new Error("Không tìm thấy bản ghi trợ lý để cập nhật");
  return updated;
};