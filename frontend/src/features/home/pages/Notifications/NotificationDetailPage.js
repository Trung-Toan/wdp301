import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";

export default function NotificationDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Giả lập dữ liệu — có thể fetch từ API sau
    const notification = {
        id,
        title: "Lịch khám của bạn đã được xác nhận",
        content:
            "Bác sĩ Nguyễn Văn A đã xác nhận lịch khám của bạn vào 09:00 ngày 18/10/2025. Vui lòng đến trước 10 phút để làm thủ tục. Cảm ơn bạn đã sử dụng MediSched 💙",
        time: "5 phút trước",
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-all mb-6"
            >
                <ArrowLeft size={18} />
                Quay lại
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-sky-100">
                <div className="flex items-center gap-3 mb-3">
                    <Bell className="h-6 w-6 text-sky-600" />
                    <h1 className="text-xl font-semibold text-gray-800">
                        {notification.title}
                    </h1>
                </div>
                <p className="text-gray-700 leading-relaxed">{notification.content}</p>
                <p className="text-sm text-gray-500 mt-4">{notification.time}</p>
            </div>
        </div>
    );
}
