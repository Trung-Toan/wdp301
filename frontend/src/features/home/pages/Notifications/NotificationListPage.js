import { useNavigate } from "react-router-dom";
import { Bell, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationListPage() {
    const navigate = useNavigate();

    const notifications = [
        {
            id: 1,
            title: "Lịch khám của bạn đã được xác nhận",
            content: "Bác sĩ Nguyễn Văn A đã xác nhận lịch khám của bạn vào 09:00 ngày 18/10/2025.",
            time: "5 phút trước",
            isRead: false,
        },
        {
            id: 2,
            title: "Nhắc nhở: Lịch khám sắp tới",
            content: "Bạn có lịch khám với bác sĩ Trần Thị B vào ngày mai. Vui lòng đến đúng giờ.",
            time: "2 giờ trước",
            isRead: true,
        },
        {
            id: 3,
            title: "Có bác sĩ mới tại Phòng khám An Khang",
            content: "Phòng khám An Khang vừa bổ sung bác sĩ chuyên khoa tim mạch mới.",
            time: "Hôm qua",
            isRead: true,
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
                <Bell className="h-6 w-6 text-sky-600" />
                <h1 className="text-2xl font-semibold text-gray-800">Thông báo</h1>
            </div>

            <div className="bg-white shadow-md rounded-xl divide-y border border-sky-100">
                {notifications.map((item) => (
                    <motion.div
                        key={item.id}
                        onClick={() => navigate(`/home/notifications/${item.id}`)}
                        className={`p-5 cursor-pointer hover:bg-sky-50 transition-all ${!item.isRead ? "bg-sky-50/60" : "bg-white"
                            }`}
                        whileHover={{ scale: 1.01 }}
                    >
                        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            {!item.isRead && (
                                <span className="inline-block h-2 w-2 bg-sky-500 rounded-full" />
                            )}
                            {item.title}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {item.content}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                            <Clock size={12} /> {item.time}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
