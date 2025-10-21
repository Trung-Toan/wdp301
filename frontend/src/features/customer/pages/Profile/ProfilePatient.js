import React, { useEffect, useState } from "react";
import PersonalTab from "./components/PersonalTab";
import HistoryTab from "./components/HistoryTab";
import RecordsTab from "./components/RecordsTab";
import SettingsTab from "./components/SettingsTab";
import Sidebar from "./components/Sidebar";
import { Spinner } from "react-bootstrap";
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
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 md:grid-cols-4">
                <div className="md:col-span-1">
                    {/* Truyền dữ liệu thật vào Sidebar */}
                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        formData={formData}
                    />
                </div>
                <div className="md:col-span-3">{renderTab()}</div>
            </div>
        </div>
    );
}
