import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownMenuRef = useRef(null);

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

    // Calculate dropdown position
    useEffect(() => {
        const updatePosition = () => {
            if (open && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 12,
                    right: window.innerWidth - rect.right,
                });
            }
        };

        if (open) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
            
            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        }
    }, [open]);

    // Close dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            const isClickInsideButton = buttonRef.current && buttonRef.current.contains(target);
            const isClickInsideMenu = dropdownMenuRef.current && dropdownMenuRef.current.contains(target);
            
            if (!isClickInsideButton && !isClickInsideMenu) {
                setOpen(false);
            }
        };

        if (open) {
            // Sử dụng mousedown với capture phase để xử lý đúng
            document.addEventListener("mousedown", handleClickOutside, true);

            return () => {
                document.removeEventListener("mousedown", handleClickOutside, true);
            };
        }
    }, [open]);

    // Handle notification click
    const handleNotificationClick = async (notification, e) => {
        e?.stopPropagation();
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
        e.preventDefault();
        await deleteNotification(notificationId);
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async (e) => {
        e?.stopPropagation();
        await markAllAsRead();
    };

    // Lấy 5 notifications gần nhất
    const recentNotifications = notifications.slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                ref={buttonRef}
                onClick={() => {
                    setOpen(!open);
                    if (!open) refresh(); // Refresh khi mở dropdown
                }}
                className="relative hidden md:flex p-3 rounded-xl hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <div className="p-1.5 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg">
                    <Bell className="h-5 w-5 text-gray-700 hover:text-sky-600 transition-colors" />
                </div>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg border-2 border-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown - Render via Portal */}
            {open && createPortal(
                <AnimatePresence>
                    <motion.div
                        ref={dropdownMenuRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed w-96 bg-white rounded-2xl shadow-2xl border-2 border-sky-100 overflow-hidden z-[99999]"
                        style={{
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-sky-200 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg">
                                    <Bell className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                                        Thông báo
                                    </h3>
                                    {unreadCount > 0 && (
                                        <p className="text-xs text-sky-600 mt-0.5 font-semibold">
                                            {unreadCount} thông báo chưa đọc
                                        </p>
                                    )}
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={(e) => handleMarkAllAsRead(e)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
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
                                        onClick={(e) => handleNotificationClick(notif, e)}
                                        className={`group relative px-5 py-4 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 transition-all duration-200 cursor-pointer border-b border-gray-100 last:border-0 transform hover:scale-[1.01] ${!notif.is_read ? "bg-gradient-to-r from-blue-50/50 to-sky-50/50 border-l-4 border-l-sky-500" : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`p-2 rounded-xl flex-shrink-0 ${!notif.is_read ? "bg-gradient-to-br from-sky-100 to-blue-100" : "bg-gray-100"}`}>
                                                <span className="text-xl">
                                                    {getNotificationIcon(notif.type)}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-bold line-clamp-2 ${!notif.is_read ? "text-gray-900" : "text-gray-700"
                                                        }`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className="inline-block w-2.5 h-2.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full flex-shrink-0 mt-1.5 shadow-md" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
                                                    {notif.content}
                                                </p>
                                                <span className="text-xs text-gray-500 mt-2 block font-medium">
                                                    {formatNotificationTime(notif.createdAt)}
                                                </span>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => handleDelete(e, notif._id)}
                                                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-red-50 rounded-lg transform hover:scale-110 active:scale-95"
                                                title="Xóa thông báo"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : !loading && !error ? (
                                <div className="p-10 text-center">
                                    <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                        <Bell className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 font-bold mb-1">
                                        Không có thông báo nào
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Các thông báo của bạn sẽ hiển thị ở đây
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        {recentNotifications.length > 0 && (
                            <div className="text-center border-t border-sky-200 bg-gradient-to-r from-gray-50 to-sky-50">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/patient/notifications");
                                        setOpen(false);
                                    }}
                                    className="w-full text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-3.5 font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-100"
                                >
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
