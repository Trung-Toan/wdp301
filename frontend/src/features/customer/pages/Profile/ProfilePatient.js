import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PersonalTab from "./components/PersonalTab";
import HistoryTab from "./components/HistoryTab";
import RecordsTab from "./components/RecordsTab";
import SettingsTab from "./components/SettingsTab";
import Sidebar from "./components/Sidebar";
import { Loader2, ChevronLeft } from "lucide-react";
import { profilePatientApi } from "../../../../api/patients/profilePatientApi";

export default function ProfilePatient() {
    const [activeTab, setActiveTab] = useState("personal");
    const [formData, setFormData] = useState(null);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await profilePatientApi.getInformation();
                const user = res.data.data;
                setFormData({
                    avatar: user.avatar_url || "https://i.pravatar.cc/150?img=12",
                    name: user.full_name || "Người dùng",
                    email: user.account.email || "Chưa có email",
                });
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };

        fetchProfile();
    }, []);

    const renderTab = () => {
        switch (activeTab) {
            case "personal":
                return <PersonalTab />;
            case "history":
                return <HistoryTab />;
            case "records":
                return <RecordsTab />;
            case "settings":
                return <SettingsTab />;
            default:
                return <PersonalTab />;
        }
    };

    // Khi chưa có dữ liệu => hiện loading
    if (!formData) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <Loader2 className="h-16 w-16 animate-spin text-sky-600 relative z-10" />
                </div>
                <p className="mt-6 text-gray-600 font-medium">Đang tải thông tin cá nhân...</p>
            </div>
        );
    }

    const handleAvatarUpdate = (newAvatar) => {
        setFormData(prev => ({
            ...prev,
            avatar: newAvatar
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50">
            {/* Back Button */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <Link 
                    to="/home" 
                    className="inline-flex items-center gap-2 text-gray-700 hover:text-sky-600 transition-all group font-medium mb-6"
                >
                    <div className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm group-hover:bg-sky-100 transition-colors shadow-sm">
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span>Quay lại trang chủ</span>
                </Link>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 lg:pb-12">
                <div className="grid gap-6 lg:gap-8 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        {/* Truyền dữ liệu thật vào Sidebar */}
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            formData={formData}
                            onAvatarUpdate={handleAvatarUpdate}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <div className="animate-fadeIn">
                            {renderTab()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
