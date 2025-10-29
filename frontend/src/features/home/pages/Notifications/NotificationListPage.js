import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../../hooks/useNotifications";
import {
    formatNotificationTime,
    getNotificationIcon,
    getNotificationColor,
    groupNotificationsByDate,
    getGroupLabel,
    getNotificationLink,
} from "../../../../utils/notificationHelpers";
import { Bell, Loader2, CheckCheck, Trash2, Filter, ChevronLeft } from "lucide-react";

export default function NotificationListPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all"); // all, unread, read

    const {
        notifications,
        unreadCount,
        loading,
        error,
        meta,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        refresh,
        hasMore,
    } = useNotifications({
        autoFetch: true,
        refreshInterval: 0, // No auto-refresh on this page
    });

    // Apply filter
    const filteredNotifications = notifications.filter((notif) => {
        if (filter === "unread") return !notif.is_read;
        if (filter === "read") return notif.is_read;
        return true; // all
    });

    // Group notifications by date
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.is_read) {
            await markAsRead(notification._id);
        }

        // Navigate to related content
        const link = getNotificationLink(notification);
        if (link) {
            navigate(link);
        }
    };

    // Handle delete
    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
            await deleteNotification(notificationId);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-sky-100 shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Bell className="h-6 w-6 text-sky-600" />
                                    Thông báo
                                </h1>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {unreadCount} thông báo chưa đọc
                                    </p>
                                )}
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                            >
                                <CheckCheck size={18} />
                                <span className="hidden sm:inline">Đánh dấu tất cả đã đọc</span>
                                <span className="sm:hidden">Đọc tất cả</span>
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { value: "all", label: "Tất cả" },
                                { value: "unread", label: "Chưa đọc" },
                                { value: "read", label: "Đã đọc" },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setFilter(item.value)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        filter === item.value
                                            ? "bg-sky-500 text-white shadow-sm"
                                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                    }`}
                                >
                                    {item.label}
                                    {item.value === "unread" && unreadCount > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-white text-sky-500 rounded-full text-xs font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Loading State */}
                {loading && notifications.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-3">{error}</p>
                        <button
                            onClick={refresh}
                            className="text-sky-600 hover:underline font-medium"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredNotifications.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {filter === "all" && "Không có thông báo nào"}
                            {filter === "unread" && "Không có thông báo chưa đọc"}
                            {filter === "read" && "Không có thông báo đã đọc"}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {filter === "all" &&
                                "Các thông báo của bạn sẽ hiển thị ở đây"}
                            {filter === "unread" &&
                                "Tất cả thông báo đã được đọc"}
                            {filter === "read" && "Bạn chưa đọc thông báo nào"}
                        </p>
                    </div>
                )}

                {/* Notifications List - Grouped by Date */}
                {!loading && !error && filteredNotifications.length > 0 && (
                    <div className="space-y-6">
                        {Object.entries(groupedNotifications).map(([group, notifs]) => {
                            if (notifs.length === 0) return null;

                            return (
                                <div key={group} className="space-y-3">
                                    {/* Group Header */}
                                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-2">
                                        {getGroupLabel(group)}
                                    </h2>

                                    {/* Notifications */}
                                    <div className="space-y-2">
                                        {notifs.map((notif) => (
                                            <div
                                                key={notif._id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={`group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border ${
                                                    !notif.is_read
                                                        ? "border-sky-200 bg-gradient-to-r from-blue-50/50 to-white"
                                                        : "border-gray-100"
                                                }`}
                                            >
                                                <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                                                    {/* Icon */}
                                                    <div
                                                        className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl ${getNotificationColor(
                                                            notif.type
                                                        )}`}
                                                    >
                                                        {getNotificationIcon(notif.type)}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <h3
                                                                className={`font-semibold text-sm sm:text-base ${
                                                                    !notif.is_read
                                                                        ? "text-gray-900"
                                                                        : "text-gray-700"
                                                                }`}
                                                            >
                                                                {notif.title}
                                                            </h3>
                                                            {!notif.is_read && (
                                                                <span className="inline-block w-2.5 h-2.5 bg-sky-500 rounded-full flex-shrink-0 mt-1.5" />
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                            {notif.content}
                                                        </p>

                                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                                            <span className="text-xs text-gray-500">
                                                                {formatNotificationTime(
                                                                    notif.createdAt
                                                                )}
                                                            </span>

                                                            {/* Metadata */}
                                                            {notif.metadata?.booking_code && (
                                                                <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                    {notif.metadata.booking_code}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => handleDelete(e, notif._id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                                                        title="Xóa thông báo"
                                                    >
                                                        <Trash2 size={18} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="px-6 py-3 bg-white border border-sky-200 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang tải...
                                        </span>
                                    ) : (
                                        "Xem thêm"
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Pagination Info */}
                        <div className="text-center text-sm text-gray-500 pt-2">
                            Hiển thị {filteredNotifications.length} / {meta.total} thông báo
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
