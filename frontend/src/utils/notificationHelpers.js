/**
 * Notification helpers và utilities
 */

/**
 * Format notification time hiển thị (relative time)
 * @param {string|Date} date - Ngày tạo notification
 * @returns {string} - "5 phút trước", "2 giờ trước", "3 ngày trước"
 */
export const formatNotificationTime = (date) => {
    if (!date) return "";

    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    
    // Nếu quá 30 ngày, hiển thị ngày cụ thể
    return notifDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

/**
 * Get icon cho notification type
 * @param {string} type - APPOINTMENT, REMINDER, CANCELLATION, etc.
 * @returns {string} - Emoji hoặc icon name
 */
export const getNotificationIcon = (type) => {
    const icons = {
        APPOINTMENT: "📅",
        CONFIRMATION: "✅",
        REMINDER: "⏰",
        CANCELLATION: "❌",
        SYSTEM: "🔔",
        REVIEW: "⭐",
    };

    return icons[type] || "🔔";
};

/**
 * Get color cho notification type
 * @param {string} type - Notification type
 * @returns {string} - Tailwind color class
 */
export const getNotificationColor = (type) => {
    const colors = {
        APPOINTMENT: "bg-blue-100 text-blue-800",
        CONFIRMATION: "bg-green-100 text-green-800",
        REMINDER: "bg-yellow-100 text-yellow-800",
        CANCELLATION: "bg-red-100 text-red-800",
        SYSTEM: "bg-gray-100 text-gray-800",
        REVIEW: "bg-purple-100 text-purple-800",
    };

    return colors[type] || "bg-gray-100 text-gray-800";
};

/**
 * Get badge color cho notification type
 * @param {string} type - Notification type
 * @returns {string} - Tailwind badge color classes
 */
export const getNotificationBadgeColor = (type) => {
    const colors = {
        APPOINTMENT: "bg-blue-500",
        CONFIRMATION: "bg-green-500",
        REMINDER: "bg-yellow-500",
        CANCELLATION: "bg-red-500",
        SYSTEM: "bg-gray-500",
        REVIEW: "bg-purple-500",
    };

    return colors[type] || "bg-blue-500";
};

/**
 * Format notification title (truncate nếu quá dài)
 * @param {string} title - Title gốc
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string}
 */
export const formatNotificationTitle = (title, maxLength = 50) => {
    if (!title) return "";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
};

/**
 * Format notification content (truncate nếu quá dài)
 * @param {string} content - Content gốc
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string}
 */
export const formatNotificationContent = (content, maxLength = 100) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
};

/**
 * Group notifications by date (Hôm nay, Hôm qua, Tuần này, Tháng này, Cũ hơn)
 * @param {Array} notifications - Danh sách notifications
 * @returns {Object} - Grouped notifications
 */
export const groupNotificationsByDate = (notifications) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const grouped = {
        today: [],
        yesterday: [],
        thisWeek: [],
        thisMonth: [],
        older: [],
    };

    notifications.forEach((notif) => {
        const notifDate = new Date(notif.createdAt);
        const notifDateOnly = new Date(
            notifDate.getFullYear(),
            notifDate.getMonth(),
            notifDate.getDate()
        );

        if (notifDateOnly.getTime() === today.getTime()) {
            grouped.today.push(notif);
        } else if (notifDateOnly.getTime() === yesterday.getTime()) {
            grouped.yesterday.push(notif);
        } else if (notifDateOnly >= weekAgo) {
            grouped.thisWeek.push(notif);
        } else if (notifDateOnly >= monthAgo) {
            grouped.thisMonth.push(notif);
        } else {
            grouped.older.push(notif);
        }
    });

    return grouped;
};

/**
 * Get label cho grouped notifications
 * @param {string} group - Group name
 * @returns {string}
 */
export const getGroupLabel = (group) => {
    const labels = {
        today: "Hôm nay",
        yesterday: "Hôm qua",
        thisWeek: "Tuần này",
        thisMonth: "Tháng này",
        older: "Cũ hơn",
    };

    return labels[group] || group;
};

/**
 * Sort notifications by date (mới nhất trước)
 * @param {Array} notifications
 * @returns {Array}
 */
export const sortNotificationsByDate = (notifications) => {
    return [...notifications].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
};

/**
 * Filter notifications by read status
 * @param {Array} notifications
 * @param {boolean} isRead
 * @returns {Array}
 */
export const filterNotificationsByReadStatus = (notifications, isRead) => {
    return notifications.filter((notif) => notif.is_read === isRead);
};

/**
 * Get notification action link/route
 * @param {Object} notification
 * @returns {string|null}
 */
export const getNotificationLink = (notification) => {
    if (notification.related_appointment) {
        return `/appointments/${notification.related_appointment._id || notification.related_appointment}`;
    }
    
    if (notification.related_clinic) {
        return `/clinic/${notification.related_clinic._id || notification.related_clinic}`;
    }
    
    if (notification.related_doctor) {
        return `/doctor/${notification.related_doctor._id || notification.related_doctor}`;
    }
    
    return null;
};

/**
 * Check if notification is recent (trong vòng 24h)
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isRecentNotification = (date) => {
    if (!date) return false;
    
    const now = new Date();
    const notifDate = new Date(date);
    const diffHours = (now - notifDate) / 3600000;
    
    return diffHours < 24;
};

/**
 * Format booking code cho notification
 * @param {Object} metadata
 * @returns {string}
 */
export const formatBookingCode = (metadata) => {
    if (!metadata || !metadata.booking_code) return "";
    return metadata.booking_code;
};

/**
 * Extract appointment info từ notification
 * @param {Object} notification
 * @returns {Object}
 */
export const extractAppointmentInfo = (notification) => {
    const metadata = notification.metadata || {};
    
    return {
        bookingCode: metadata.booking_code || "",
        scheduledDate: metadata.scheduled_date || "",
        doctorName: metadata.doctor_name || "",
        clinicName: metadata.clinic_name || "",
        specialtyName: metadata.specialty_name || "",
    };
};

