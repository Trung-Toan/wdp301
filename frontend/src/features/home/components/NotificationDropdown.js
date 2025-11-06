import { useState, useEffect, useRef } from "react";
import { Bell, Loader2, CheckCheck, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../hooks/useNotifications";
import {
    formatNotificationTime,
    getNotificationIcon,
    getNotificationLink,
} from "../../../utils/notificationHelpers";

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
    } = useNotifications({
        autoFetch: true,
        refreshInterval: 60000, // Refresh mỗi 60s
    });

    // Close dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        console.log("🔍 Notification clicked:", notification);
        
        // Mark as read
        if (!notification.is_read) {
            await markAsRead(notification._id);
        }

        // Navigate to related content
        const link = getNotificationLink(notification);
        console.log("🔗 Navigation link:", link);
        
        if (link) {
            navigate(link);
            setOpen(false);
        } else {
            console.warn("⚠️ No navigation link for notification:", notification);
        }
    };

    // Handle delete
    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    // Lấy 5 notifications gần nhất
    const recentNotifications = notifications.slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => {
                    setOpen(!open);
                    if (!open) refresh(); // Refresh khi mở dropdown
                }}
                className="relative hidden md:flex p-2 rounded-full hover:bg-sky-50 transition-all duration-150"
            >
                <Bell className="h-5 w-5 text-gray-700 hover:text-sky-600 transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-semibold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-sky-800">
                                    Thông báo
                                </h3>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-sky-600 mt-0.5">
                                        {unreadCount} thông báo chưa đọc
                                    </p>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
                                    title="Đánh dấu tất cả đã đọc"
                                >
                                    <CheckCheck size={14} />
                                    <span>Đọc tất cả</span>
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading && (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                                </div>
                            )}

                            {error && (
                                <div className="p-4 text-center">
                                    <p className="text-sm text-red-500">{error}</p>
                                    <button
                                        onClick={refresh}
                                        className="mt-2 text-xs text-sky-600 hover:underline"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            )}

                            {!loading && !error && recentNotifications.length > 0 ? (
                                recentNotifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`group relative px-4 py-3 hover:bg-sky-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 ${!notif.is_read ? "bg-blue-50/30" : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <span className="text-2xl flex-shrink-0">
                                                {getNotificationIcon(notif.type)}
                                            </span>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-medium line-clamp-2 ${!notif.is_read ? "text-gray-900" : "text-gray-700"
                                                        }`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className="inline-block w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                                    {notif.content}
                                                </p>
                                                <span className="text-xs text-gray-500 mt-1.5 block">
                                                    {formatNotificationTime(notif.createdAt)}
                                                </span>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => handleDelete(e, notif._id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                                                title="Xóa thông báo"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : !loading && !error ? (
                                <div className="p-8 text-center">
                                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">
                                        Không có thông báo nào
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Các thông báo của bạn sẽ hiển thị ở đây
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        {recentNotifications.length > 0 && (
                            <div className="text-center border-t border-sky-100 bg-gray-50">
                                <button
                                    onClick={() => {
                                        navigate("/patient/notifications");
                                        setOpen(false);
                                    }}
                                    className="w-full text-sm text-sky-600 py-3 hover:bg-sky-50 font-semibold transition-all"
                                >
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
