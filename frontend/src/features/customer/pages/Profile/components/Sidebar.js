import React from "react"
import { User, Shield, FileText, Clock, Lock, LogOut } from "lucide-react"

export default function Sidebar({ activeTab, setActiveTab, formData }) {
    const tabs = [
        { name: "Thông tin cá nhân", key: "personal", icon: User },
        { name: "Lịch sử khám", key: "history", icon: Shield },
        { name: "Hồ sơ bệnh án", key: "records", icon: FileText },
        { name: "Yêu cầu truy cập", key: "access", icon: Clock },
        { name: "Cài đặt", key: "settings", icon: Lock },
    ]

    return (
        <div className="p-6 border rounded-lg shadow flex flex-col items-center gap-4">
            <img src={formData.avatar} alt="Avatar" className="h-24 w-24 rounded-full border-4 border-primary" />
            <div className="text-center">
                <h3 className="text-lg font-semibold">{formData.name}</h3>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
            </div>

            <div className="w-full border-t pt-4">
                <nav className="flex flex-col gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.name}
                            </button>
                        )
                    })}
                </nav>
            </div>
            <button className="mt-auto bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Đăng xuất
            </button>
        </div>
    )
}
