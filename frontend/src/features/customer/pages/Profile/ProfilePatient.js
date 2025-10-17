import React, { useState } from "react";
import PersonalTab from "./components/PersonalTab";
import HistoryTab from "./components/HistoryTab";
import RecordsTab from "./components/RecordsTab";
import AccessRequestsTab from "./components/AccessRequestsTab";
import SettingsTab from "./components/SettingsTab";
import Sidebar from "./components/Sidebar";

export default function ProfilePatient() {
    const [activeTab, setActiveTab] = useState("personal");

    // Dữ liệu giả (formData) — truyền sang Sidebar
    const formData = {
        avatar: "https://i.pravatar.cc/150?img=12",
        name: "Nguyễn Nam Phong",
        email: "phongnguyen@example.com",
    };

    const renderTab = () => {
        switch (activeTab) {
            case "personal":
                return <PersonalTab />;
            case "history":
                return <HistoryTab />;
            case "records":
                return <RecordsTab />;
            case "access":
                return <AccessRequestsTab />;
            case "settings":
                return <SettingsTab />;
            default:
                return <PersonalTab />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 md:grid-cols-4">
                <div className="md:col-span-1">
                    {/* Truyền formData vào đây */}
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
