const Notification = require("../../model/system/Notifications");
const Patient = require("../../model/patient/Patient");
const mongoose = require("mongoose");

/**
 * Tạo notification cho bệnh nhân sau khi đặt lịch thành công
 */
async function createAppointmentNotification(appointmentData) {
    try {
        // Lấy thông tin patient -> user_id -> account_id
        const patient = await Patient.findById(appointmentData.patient_id)
            .populate({
                path: "user_id",
                select: "account_id full_name"
            })
            .lean();

        if (!patient || !patient.user_id || !patient.user_id.account_id) {
            console.error("Patient, user_id, or account_id not found for notification");
            console.log("Patient data:", patient);
            return null;
        }

        const accountId = patient.user_id.account_id;

        const notification = new Notification({
            title: "Đặt lịch khám thành công",
            type: "APPOINTMENT",
            content: `Bạn đã đặt lịch khám thành công với ${appointmentData.doctor_id?.user_id?.full_name || "bác sĩ"} vào ngày ${new Date(appointmentData.scheduled_date).toLocaleDateString("vi-VN")}. Mã đặt lịch: ${appointmentData.booking_code}`,
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
                specialty_name: appointmentData.specialty_id?.name
            }
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
                    select: "full_name avatar_url"
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments(filter)
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
                is_read: false 
            })
        }
    };
}

/**
 * Đánh dấu notification đã đọc
 */
async function markAsRead(notificationId, accountId) {
    const notification = await Notification.findOneAndUpdate(
        { 
            _id: notificationId, 
            recipient_id: accountId 
        },
        { 
            is_read: true, 
            read_at: new Date() 
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
            is_read: false 
        },
        { 
            is_read: true, 
            read_at: new Date() 
        }
    );

    return {
        modified_count: result.modifiedCount
    };
}

/**
 * Lấy số lượng notifications chưa đọc
 */
async function getUnreadCount(accountId) {
    const count = await Notification.countDocuments({
        recipient_id: accountId,
        is_read: false
    });

    return { unread_count: count };
}

/**
 * Xóa notification
 */
async function deleteNotification(notificationId, accountId) {
    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient_id: accountId
    });

    if (!notification) {
        throw new Error("Notification not found");
    }

    return { message: "Notification deleted successfully" };
}

/**
 * Tạo notification cho bệnh nhân khi status lịch khám thay đổi (Duyệt/Hủy)
 */
async function createAppointmentStatusUpdateNotification(appointmentData, newStatus) {
    try {
        const patient = await Patient.findById(appointmentData.patient_id)
            .populate({
                path: "user_id",
                select: "account_id full_name"
            })
            .lean();

        if (!patient || !patient.user_id || !patient.user_id.account_id) {
            console.error("Patient, user_id, or account_id not found for status update notification");
            return null;
        }

        const accountId = patient.user_id.account_id;
        let title, content, type;

        // Tùy chỉnh thông báo dựa trên trạng thái mới
        if (newStatus === "APPROVE") {
            title = "Lịch khám đã được xác nhận";
            type = "CONFIRMATION"; 
            content = `Lịch khám của bạn (Mã: ${appointmentData.booking_code}) với ${appointmentData.doctor_id?.user_id?.full_name || "bác sĩ"} vào ngày ${new Date(appointmentData.scheduled_date).getUTCDay()} - ${new Date(appointmentData.scheduled_date).getUTCMonth()} - ${new Date(appointmentData.scheduled_date).getUTCFullYear()} đã được xác nhận.`;
        } else if (newStatus === "CANCELLED") {
            title = "Lịch khám đã bị hủy";
            type = "CANCELLATION"; 
            content = `Lịch khám của bạn (Mã: ${appointmentData.booking_code}) với ${appointmentData.doctor_id?.user_id?.full_name || "bác sĩ"} vào ngày ${new Date(appointmentData.scheduled_date).getUTCDay()} - ${new Date(appointmentData.scheduled_date).getUTCMonth()} - ${new Date(appointmentData.scheduled_date).getUTCFullYear()} đã bị hủy.`;
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
                status: newStatus 
            }
        });

        console.log("notification: ", notification);

        await notification.save();
        return notification;

    } catch (error) {
        console.error(`Error creating ${newStatus} notification:`, error);
        // Không ném lỗi để tránh làm hỏng flow chính
        return null;
    }
}



module.exports = {
    createAppointmentNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    createAppointmentStatusUpdateNotification
};

