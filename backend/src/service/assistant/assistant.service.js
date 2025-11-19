const Account = require("../../model/auth/Account");
const User = require("../../model/user/User");
const Assistant = require("../../model/user/Assistant");
const patientService = require("../../service/patient/patient.service");
const MedicalRecord = require("../../model/patient/MedicalRecord");
const Appointment = require("../../model/appointment/Appointment");
const mongoose = require("mongoose");

/**
 * Dashboard cho trợ lý (ASSISTANT)
 * - Dựa vào doctor_id mà trợ lý đang hỗ trợ
 * - Trả về đúng shape FE đang dùng
 */
exports.getDashboard = async (assistantId) => {
  // Lấy doctor_id gắn với trợ lý và populate thông tin doctor
  const assistant = await Assistant.findById(assistantId)
    .select("doctor_id")
    .populate({
      path: "doctor_id",
      select: "title degree specialty_id user_id clinic_id",
      populate: [
        {
          path: "user_id",
          select: "full_name avatar_url"
        },
        {
          path: "specialty_id",
          select: "name description"
        },
        {
          path: "clinic_id",
          select: "name address phone"
        }
      ]
    })
    .lean();
  if (!assistant || !assistant.doctor_id) {
    throw new Error("Trợ lý chưa được gán bác sĩ.");
  }
  
  // Lấy doctorId từ object đã populate (có thể là object hoặc ObjectId)
  const doctorIdValue = assistant.doctor_id._id || assistant.doctor_id;
  const doctorId = new mongoose.Types.ObjectId(doctorIdValue);

  // Mốc thời gian trong ngày hiện tại (giờ local server)
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const endOfYesterday = new Date(startOfToday);

  // Quy ước trạng thái dùng cho hôm nay
  const ACTIVE_TODAY = ["SCHEDULED", "APPROVE", "COMPLETED"];

  // Chạy song song các thống kê
  const [
    todayCompleted,
    todayTotal,
    yesterdayTotal,
    pendingApptsToday,
    pendingRxByAssistant,
    totalPatientsDistinct
  ] = await Promise.all([
    // 1) Completed hôm nay
    Appointment.countDocuments({
      doctor_id: doctorId,
      scheduled_date: { $gte: startOfToday, $lt: endOfToday },
      status: "COMPLETED",
    }),

    // 2) Tổng lịch hôm nay
    Appointment.countDocuments({
      doctor_id: doctorId,
      scheduled_date: { $gte: startOfToday, $lt: endOfToday },
      status: { $in: ACTIVE_TODAY },
    }),

    // 3) Tổng lịch hôm qua (để tính % change)
    Appointment.countDocuments({
      doctor_id: doctorId,
      scheduled_date: { $gte: startOfYesterday, $lt: endOfYesterday },
      status: { $in: ACTIVE_TODAY },
    }),

    // 4) Lịch chờ duyệt hôm nay
    Appointment.countDocuments({
      doctor_id: doctorId,
      scheduled_date: { $gte: startOfToday, $lt: endOfToday },
      status: "SCHEDULED",
    }),

    // 5) Đơn thuốc chờ bác sĩ duyệt — các bệnh án do trợ lý này tạo
    MedicalRecord.countDocuments({
      created_by: assistantId,
      "prescription.status": "PENDING",
    }),

    // 6) Tổng bệnh nhân distinct (loại CANCELLED/NO_SHOW/REJECTED)
    Appointment.distinct("patient_id", {
      doctor_id: doctorId,
      status: { $nin: ["CANCELLED", "NO_SHOW", "REJECTED"] },
    }),
  ]);

  const appointmentChange =
    yesterdayTotal === 0 ? (todayTotal > 0 ? 100 : 0)
                         : Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100);

  // Format thông tin doctor
  const doctor = assistant.doctor_id;
  const doctorInfo = doctor ? {
    _id: doctor._id?.toString() || doctor._id,
    title: doctor.title || "",
    degree: doctor.degree || "",
    name: doctor.user_id?.full_name || "Chưa rõ tên",
    avatar_url: doctor.user_id?.avatar_url || null,
    specialties: Array.isArray(doctor.specialty_id) 
      ? doctor.specialty_id.map(s => s.name || s) 
      : (doctor.specialty_id?.name ? [doctor.specialty_id.name] : []),
    clinic: doctor.clinic_id ? {
      name: doctor.clinic_id.name || "Chưa có cơ sở",
      address: doctor.clinic_id.address || null,
      phone: doctor.clinic_id.phone || null,
    } : null,
  } : null;

  return {
    todayPatients: todayCompleted,
    appointmentChange,
    pendingPrescriptions: pendingRxByAssistant,
    pendingRequests: pendingApptsToday,
    totalPatients: Array.isArray(totalPatientsDistinct) ? totalPatientsDistinct.length : 0,
    // FE label "Tổng lịch hẹn hôm nay" đang đọc từ upcomingAppointments
    upcomingAppointments: todayTotal,
    doctor: doctorInfo,
  };
};

exports.findAssistantById = async (assistantId) => {
  const assistant = await Assistant.findById(assistantId);
  return assistant || null;
}

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