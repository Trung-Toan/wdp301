const Notification = require("../../model/system/Notifications");
const Patient = require("../../model/patient/Patient");
const mongoose = require("mongoose");
const MedicalRecord = require("../../model/patient/MedicalRecord");
const doctorService = require("../doctor/doctor.service");
const userService = require("../user/user.service");

/**
 * Tạo notification cho bệnh nhân sau khi đặt lịch thành công
 */
async function createAppointmentNotification(appointmentData) {
  try {
    // Xác định recipient: Nếu booking cho người thân, gửi cho người đặt lịch (booked_by_user_id)
    let accountId = null;
    let recipientName = "";

    if (appointmentData.booking_for === "relative" && appointmentData.booked_by_user_id) {
      // Trường hợp đặt lịch cho người thân: Gửi notification cho người đặt lịch
      const User = require("../../model/user/User");
      const user = await User.findById(appointmentData.booked_by_user_id)
        .populate({
          path: "account_id",
          select: "_id",
        })
        .lean();

      if (user && user.account_id) {
        accountId = user.account_id._id || user.account_id;
        recipientName = user.full_name || "Bạn";
      } else {
        console.error("User or account_id not found for booked_by_user_id:", appointmentData.booked_by_user_id);
        // Fallback về patient_id nếu không tìm thấy booked_by_user_id
        const patient = await Patient.findById(appointmentData.patient_id)
          .populate({
            path: "user_id",
            select: "account_id full_name",
          })
          .lean();
        if (patient && patient.user_id && patient.user_id.account_id) {
          accountId = patient.user_id.account_id;
          recipientName = patient.user_id.full_name || "Bạn";
        }
      }
    } else {
      // Trường hợp đặt lịch cho bản thân: Gửi notification cho patient
      const patient = await Patient.findById(appointmentData.patient_id)
        .populate({
          path: "user_id",
          select: "account_id full_name",
        })
        .lean();

      if (patient && patient.user_id && patient.user_id.account_id) {
        accountId = patient.user_id.account_id;
        recipientName = patient.user_id.full_name || "Bạn";
      }
    }

    if (!accountId) {
      console.error(
        "Account ID not found for notification"
      );
      return null;
    }

    // Tạo nội dung notification dựa trên booking_for
    let title, content;
    if (appointmentData.booking_for === "relative") {
      title = "Đặt lịch khám cho người thân thành công";
      content = `Bạn đã đặt lịch khám thành công cho ${
        appointmentData.full_name || "người thân"
      } với ${
        appointmentData.doctor_id?.user_id?.full_name || "bác sĩ"
      } vào ngày ${new Date(appointmentData.scheduled_date).toLocaleDateString(
        "vi-VN"
      )}. Mã đặt lịch: ${appointmentData.booking_code}`;
    } else {
      title = "Đặt lịch khám thành công";
      content = `Bạn đã đặt lịch khám thành công với ${
        appointmentData.doctor_id?.user_id?.full_name || "bác sĩ"
      } vào ngày ${new Date(appointmentData.scheduled_date).toLocaleDateString(
        "vi-VN"
      )}. Mã đặt lịch: ${appointmentData.booking_code}`;
    }

    const notification = new Notification({
      title: title,
      type: "APPOINTMENT",
      content: content,
      recipient_id: accountId,
      recipient_type: "PATIENT",
      related_appointment: appointmentData._id,
      related_clinic: appointmentData.clinic_id,
      related_doctor: appointmentData.doctor_id?._id,
      metadata: {
        booking_code: appointmentData.booking_code,
        scheduled_date: appointmentData.scheduled_date,
        doctor_name: appointmentData.doctor_id?.user_id?.full_name,
        clinic_name: appointmentData.clinic_id?.name,
        specialty_name: appointmentData.specialty_id?.name,
        booking_for: appointmentData.booking_for || "self",
        relative_name: appointmentData.booking_for === "relative" ? appointmentData.full_name : null,
      },
    });

    await notification.save();
    console.log("✅ Notification created successfully for account:", accountId);
    return notification;
  } catch (error) {
    console.error("Error creating appointment notification:", error);
    // Don't throw error to prevent booking failure
    return null;
  }
}

/**
 * Lấy danh sách notifications của user
 */
async function getNotifications(accountId, { page = 1, limit = 20, isRead }) {
  const filter = { recipient_id: new mongoose.Types.ObjectId(accountId) };

  if (typeof isRead === "boolean") {
    filter.is_read = isRead;
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate("related_appointment", "booking_code scheduled_date status")
      .populate("related_clinic", "name")
      .populate({
        path: "related_doctor",
        populate: {
          path: "user_id",
          select: "full_name avatar_url",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    data: notifications,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unread_count: await Notification.countDocuments({
        recipient_id: accountId,
        is_read: false,
      }),
    },
  };
}

/**
 * Đánh dấu notification đã đọc
 */
async function markAsRead(notificationId, accountId) {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient_id: accountId,
    },
    {
      is_read: true,
      read_at: new Date(),
    },
    { new: true }
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
}

/**
 * Đánh dấu tất cả notifications đã đọc
 */
async function markAllAsRead(accountId) {
  const result = await Notification.updateMany(
    {
      recipient_id: accountId,
      is_read: false,
    },
    {
      is_read: true,
      read_at: new Date(),
    }
  );

  return {
    modified_count: result.modifiedCount,
  };
}

/**
 * Lấy số lượng notifications chưa đọc
 */
async function getUnreadCount(accountId) {
  const count = await Notification.countDocuments({
    recipient_id: accountId,
    is_read: false,
  });

  return { unread_count: count };
}

/**
 * Xóa notification
 */
async function deleteNotification(notificationId, accountId) {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient_id: accountId,
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return { message: "Notification deleted successfully" };
}

/**
 * Tạo notification cho bệnh nhân khi status lịch khám thay đổi (Duyệt/Hủy)
 */
async function createAppointmentStatusUpdateNotification(
  appointmentData,
  newStatus
) {
  try {
    const patient = await Patient.findById(appointmentData.patient_id)
      .populate({
        path: "user_id",
        select: "account_id full_name",
      })
      .lean();

    if (!patient || !patient.user_id || !patient.user_id.account_id) {
      console.error(
        "Patient, user_id, or account_id not found for status update notification"
      );
      return null;
    }

    const accountId = patient.user_id.account_id;
    let title, content, type;

    // Tùy chỉnh thông báo dựa trên trạng thái mới
    if (newStatus === "APPROVE") {
      title = "Lịch khám đã được xác nhận";
      type = "CONFIRMATION";
      content = `Lịch khám của bạn (Mã: ${appointmentData.booking_code}) với ${
        appointmentData.doctor_id?.user_id?.full_name || "bác sĩ"
      } vào ngày ${new Date(
        appointmentData.scheduled_date
      ).getUTCDay()} - ${new Date(
        appointmentData.scheduled_date
      ).getUTCMonth()} - ${new Date(
        appointmentData.scheduled_date
      ).getUTCFullYear()} đã được xác nhận.`;
    } else if (newStatus === "CANCELLED") {
      title = "Lịch khám đã bị hủy";
      type = "CANCELLATION";
      content = `Lịch khám của bạn (Mã: ${appointmentData.booking_code}) với ${
        appointmentData.doctor_id?.user_id?.full_name || "bác sĩ"
      } vào ngày ${new Date(
        appointmentData.scheduled_date
      ).getUTCDay()} - ${new Date(
        appointmentData.scheduled_date
      ).getUTCMonth()} - ${new Date(
        appointmentData.scheduled_date
      ).getUTCFullYear()} đã bị hủy.`;
    } else {
      console.log(`No notification template for status: ${newStatus}`);
      return null;
    }

    const notification = new Notification({
      title: title,
      type: type,
      content: content,
      recipient_id: accountId,
      recipient_type: "PATIENT",
      related_appointment: appointmentData._id,
      related_clinic: appointmentData.clinic_id?._id,
      related_doctor: appointmentData.doctor_id?._id,
      metadata: {
        booking_code: appointmentData.booking_code,
        scheduled_date: appointmentData.scheduled_date,
        doctor_name: appointmentData.doctor_id?.user_id?.full_name,
        clinic_name: appointmentData.clinic_id?.name,
        specialty_name: appointmentData.specialty_id?.name,
        status: newStatus,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error(`Error creating ${newStatus} notification:`, error);
    // Không ném lỗi để tránh làm hỏng flow chính
    return null;
  }
}

/**
 * Tạo notification cho bệnh nhân khi bác sĩ gửi yêu cầu xem hồ sơ bệnh án
 * @param {Array|Object} requests - mảng các request hoặc 1 request, có dạng:
 *  {
 *    createdAt,
 *    diagnosis,
 *    doctor_id,
 *    medical_record_id,
 *    patient_code,
 *    patient_id,
 *    patient_name,
 *    prescription_status,
 *    updatedAt
 *  }
 * @param {Object} doctorUser - (optional) thông tin user của bác sĩ từ req.user
 */
async function createMedicalRecordViewRequestNotification(
  requests,
  doctorUser
) {
  doctorUser = await userService.findUserByAccountId(doctorUser.sub);

  try {
    const list = Array.isArray(requests) ? requests : [requests];

    for (const reqItem of list) {
      if (!reqItem) continue;
      const medicalRecord = await MedicalRecord.findById(
        reqItem.record_id
      ).lean();
      // Lấy thông tin bệnh nhân + account_id
      const patient = await Patient.findById(medicalRecord?.patient_id)
        .populate({
          path: "user_id",
          select: "account_id full_name",
        })
        .lean();

      if (!patient || !patient.user_id || !patient.user_id.account_id) {
        console.error(
          "[Notify] Patient or account_id not found for medical record request"
        );
        continue;
      }

      const accountId = patient.user_id.account_id;

      // Lấy tên bác sĩ (ưu tiên từ doctorUser nếu middleware đã attach)
      let doctorName = "bác sĩ";
      let doctorDoc = null;

      try {
        if (doctorUser && doctorUser?.full_name) {
          doctorName = doctorUser ? doctorUser.full_name : "bác sĩ";
        } else if (reqItem.doctor_id) {
          doctorDoc = await Doctor.findById(reqItem.doctor_id)
            .populate({ path: "user_id", select: "full_name" })
            .lean();
          if (doctorDoc?.user_id?.full_name) {
            doctorName = doctorDoc.user_id.full_name;
          }
        }
      } catch (e) {
        console.error("[Notify] Error fetching doctor info:", e);
      }

      const diagnosisText = reqItem.diagnosis || "chưa có chẩn đoán";

      const notification = new Notification({
        title: "Yêu cầu xem hồ sơ bệnh án",
        type: "CONFIRMATION",
        content: `Bác sĩ ${doctorName} vừa gửi yêu cầu xem hồ sơ bệnh án của bạn với chẩn đoán "${diagnosisText}". Vui lòng chờ hệ thống phê duyệt.`,
        recipient_id: accountId,
        recipient_type: "PATIENT",
        related_doctor: reqItem.doctor_id || doctorDoc?._id || undefined,
        metadata: {
          medical_record_id: reqItem.medical_record_id,
          diagnosis: reqItem.diagnosis,
          patient_code: reqItem.patient_code,
          patient_name: reqItem.patient_name,
          doctor_name: doctorName,
          request_created_at: reqItem.createdAt,
        },
      });

      const notify = await notification.save();
      return notify;
    }
  } catch (error) {
    console.error(
      "Error creating medical record view request notifications:",
      error
    );
    // Không throw để tránh làm hỏng flow chính
    return null;
  }
}

module.exports = {
  createMedicalRecordViewRequestNotification,
  createAppointmentNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  createAppointmentStatusUpdateNotification,
};
