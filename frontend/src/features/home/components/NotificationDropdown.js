import { useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Lịch khám của bạn đã được xác nhận",
            time: "5 phút trước",
        },
        {
            id: 2,
            title: "Có bác sĩ mới tại cơ sở Phòng Khám An Khang",
            time: "2 giờ trước",
        },
        {
            id: 3,
            title: "Nhắc nhở: Bạn có lịch khám vào ngày mai",
            time: "Hôm qua",
        },
    ]);

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setOpen(!open)}
                className="relative hidden md:flex p-2 rounded-full hover:bg-sky-50 transition-all duration-150"
            >
                <Bell className="h-5 w-5 text-gray-700 hover:text-sky-600 transition-colors" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-semibold text-white bg-red-500 rounded-full">
                        {notifications.length}
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
                        className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden z-50"
                    >
                        <div className="p-3 border-b border-sky-100 bg-sky-50">
                            <h3 className="text-sm font-semibold text-sky-700">
                                Thông báo ({notifications.length})
                            </h3>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(`/home/notifications/${item.id}`)}
                                        className="px-4 py-3 hover:bg-sky-50 transition-colors cursor-pointer"
                                    >
                                        <p className="text-sm text-gray-800 font-medium">
                                            {item.title}
                                        </p>
                                        <span className="text-xs text-gray-500">{item.time}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    Không có thông báo mới
                                </div>
                            )}
                        </div>

                        <div className="text-center border-t border-sky-100">
                            <button
                                onClick={() => navigate("/home/notifications")}
                                className="w-full text-sm text-sky-600 py-2 hover:bg-sky-50 font-medium transition-all"
                            >
                                Xem tất cả
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
