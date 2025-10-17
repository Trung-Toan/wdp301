import React, { useState } from "react";
import { Edit2, Save, X } from "lucide-react";

export default function PersonalTab() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phone: "0912345678",
        dateOfBirth: "1990-05-15",
        gender: "Nam",
        address: "123 Đường ABC, Quận 1, TP.HCM",
    });
    const [editData, setEditData] = useState(formData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleSave = () => {
        setFormData(editData);
        setIsEditing(false);
    };

    const handleCancel = () => setIsEditing(false);

    return (
        <div className="p-6 border rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="border px-4 py-2 rounded-md flex items-center gap-2"
                    >
                        <Edit2 size={16} /> Chỉnh sửa
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {Object.keys(editData).map((key) => (
                            <div key={key}>
                                <label className="block text-sm font-medium mb-2 capitalize">
                                    {key}
                                </label>
                                <input
                                    name={key}
                                    value={editData[key]}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                        >
                            <Save size={16} /> Lưu thay đổi
                        </button>
                        <button
                            onClick={handleCancel}
                            className="border px-4 py-2 rounded-md flex items-center gap-2"
                        >
                            <X size={16} /> Hủy
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(formData).map(([label, value]) => (
                        <div key={label}>
                            <p className="text-sm text-gray-500 capitalize">{label}</p>
                            <p className="font-semibold">{value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
