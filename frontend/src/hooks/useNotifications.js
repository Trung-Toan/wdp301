import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "../api/notification/notificationApi";

/**
 * Custom hook để quản lý notifications
 * @param {Object} options - Configuration options
 * @param {boolean} [options.autoFetch=true] - Tự động fetch khi mount
 * @param {number} [options.refreshInterval] - Interval tự động refresh (ms)
 * @returns {Object} - Notification state và methods
 */
export const useNotifications = ({ autoFetch = true, refreshInterval } = {}) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
    });

    /**
     * Fetch notifications
     */
    const fetchNotifications = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            const response = await notificationApi.getNotifications({
                page: params.page || meta.page,
                limit: params.limit || meta.limit,
                isRead: params.isRead,
            });

            if (response.data.success) {
                setNotifications(response.data.data || []);
                setMeta(response.data.meta || {});
                setUnreadCount(response.data.meta?.unread_count || 0);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load notifications");
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.limit]);

    /**
     * Fetch unread count only
     */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationApi.getUnreadCount();
            if (response.data.success) {
                setUnreadCount(response.data.unread_count || 0);
            }
        } catch (err) {
            console.error("Error fetching unread count:", err);
        }
    }, []);

    /**
     * Mark notification as read
     */
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const response = await notificationApi.markAsRead(notificationId);
            
            if (response.data.success) {
                // Update local state
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif._id === notificationId
                            ? { ...notif, is_read: true, read_at: new Date() }
                            : notif
                    )
                );
                
                // Decrease unread count
                setUnreadCount((prev) => Math.max(0, prev - 1));
                
                return true;
            }
        } catch (err) {
            console.error("Error marking as read:", err);
            return false;
        }
    }, []);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await notificationApi.markAllAsRead();
            
            if (response.data.success) {
                // Update all notifications to read
                setNotifications((prev) =>
                    prev.map((notif) => ({
                        ...notif,
                        is_read: true,
                        read_at: new Date(),
                    }))
                );
                
                setUnreadCount(0);
                return true;
            }
        } catch (err) {
            console.error("Error marking all as read:", err);
            return false;
        }
    }, []);

    /**
     * Delete notification
     */
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            const response = await notificationApi.deleteNotification(notificationId);
            
            if (response.data.success) {
                // Remove from local state
                setNotifications((prev) => {
                    const deleted = prev.find((n) => n._id === notificationId);
                    
                    // If deleted notification was unread, decrease count
                    if (deleted && !deleted.is_read) {
                        setUnreadCount((count) => Math.max(0, count - 1));
                    }
                    
                    return prev.filter((n) => n._id !== notificationId);
                });
                
                return true;
            }
        } catch (err) {
            console.error("Error deleting notification:", err);
            return false;
        }
    }, []);

    /**
     * Load more notifications (pagination)
     */
    const loadMore = useCallback(() => {
        if (meta.page < meta.totalPages) {
            fetchNotifications({ page: meta.page + 1 });
        }
    }, [meta.page, meta.totalPages, fetchNotifications]);

    /**
     * Refresh notifications
     */
    const refresh = useCallback(() => {
        fetchNotifications({ page: 1 });
    }, [fetchNotifications]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchNotifications();
        }
    }, [autoFetch]); // Only run on mount

    // Auto-refresh interval
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchUnreadCount]);

    return {
        // State
        notifications,
        unreadCount,
        loading,
        error,
        meta,
        
        // Methods
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        refresh,
        
        // Computed
        hasMore: meta.page < meta.totalPages,
        hasNotifications: notifications.length > 0,
    };
};

