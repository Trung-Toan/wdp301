const notificationService = require("../../service/notification/notification.service");

/**
 * Lấy danh sách notifications của user
 * GET /api/notifications?page=1&limit=20&isRead=false
 */
exports.getNotifications = async (req, res) => {
    try {
        const accountId = req.user.id; // From authRequired middleware
        const { page, limit, isRead } = req.query;

        const result = await notificationService.getNotifications(accountId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            isRead: isRead === "true" ? true : isRead === "false" ? false : undefined
        });

        return res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Error getting notifications:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to get notifications"
        });
    }
};

/**
 * Đánh dấu notification đã đọc
 * PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
    try {
        const accountId = req.user.id;
        const { id } = req.params;

        const notification = await notificationService.markAsRead(id, accountId);

        return res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(404).json({
            success: false,
            error: error.message || "Notification not found"
        });
    }
};

/**
 * Đánh dấu tất cả notifications đã đọc
 * PUT /api/notifications/mark-all-read
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const accountId = req.user.id;

        const result = await notificationService.markAllAsRead(accountId);

        return res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Error marking all as read:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to mark all as read"
        });
    }
};

/**
 * Lấy số lượng notifications chưa đọc
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const accountId = req.user.id;

        const result = await notificationService.getUnreadCount(accountId);

        return res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Error getting unread count:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to get unread count"
        });
    }
};

/**
 * Xóa notification
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
    try {
        const accountId = req.user.id;
        const { id } = req.params;

        const result = await notificationService.deleteNotification(id, accountId);

        return res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return res.status(404).json({
            success: false,
            error: error.message || "Notification not found"
        });
    }
};

