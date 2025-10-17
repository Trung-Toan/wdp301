import React, { useState } from "react";

export default function SettingsTab() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Cài đặt</h2>

            <div className="space-y-4">
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                    />
                    Nhận thông báo qua email
                </label>

                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />
                    Bật chế độ tối
                </label>
            </div>
        </div>
    );
}
