import { axiosInstance } from "../axiosInstance";

export const notificationApi = {
    /**
     * Lấy danh sách notifications
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Trang hiện tại
     * @param {number} [params.limit=20] - Số lượng mỗi trang
     * @param {boolean} [params.isRead] - Lọc theo trạng thái đã đọc
     * @returns {Promise} - { data: [], meta: { total, page, limit, totalPages, unread_count } }
     */
    getNotifications: (params) => axiosInstance.get("/notifications", { params }),

    /**
     * Lấy số lượng notifications chưa đọc
     * @returns {Promise} - { unread_count: number }
     */
    getUnreadCount: () => axiosInstance.get("/notifications/unread-count"),

    /**
     * Đánh dấu notification đã đọc
     * @param {string} notificationId - ID của notification
     * @returns {Promise}
     */
    markAsRead: (notificationId) => axiosInstance.put(`/notifications/${notificationId}/read`),

    /**
     * Đánh dấu tất cả notifications đã đọc
     * @returns {Promise} - { modified_count: number }
     */
    markAllAsRead: () => axiosInstance.put("/notifications/mark-all-read"),

    /**
     * Xóa notification
     * @param {string} notificationId - ID của notification
     * @returns {Promise}
     */
    deleteNotification: (notificationId) => axiosInstance.delete(`/notifications/${notificationId}`),
};

