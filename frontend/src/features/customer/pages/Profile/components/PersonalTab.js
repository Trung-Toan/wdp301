import React, { useState, useEffect } from "react";
import { Edit2, Save, X } from "lucide-react";

import { toast } from "react-toastify";
import { profilePatientApi } from "../../../../../api/patients/profilePatientApi";

export default function PersonalTab() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        dob: "",
        gender: "",
        address: "",
        email: "", // chỉ để hiển thị (nếu muốn), backend có thể không cập nhật trường này
        phone_number: "",
    });
    const [editData, setEditData] = useState(formData);

    //  Load thông tin khi mở trang
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await profilePatientApi.getInformation();
                if (res.data.success) {
                    const data = res.data.data;
                    setFormData({
                        full_name: data.full_name || "",
                        dob: data.dob ? data.dob.split("T")[0] : "",
                        gender: data.gender || "",
                        address: data.address || "",
                        email: data.account_id?.email || "",
                        phone_number: data.account_id?.phone_number || "",
                    });
                    setEditData({
                        full_name: data.full_name || "",
                        dob: data.dob ? data.dob.split("T")[0] : "",
                        gender: data.gender || "",
                        address: data.address || "",
                        email: data.account_id?.email || "",
                        phone_number: data.account_id?.phone_number || "",
                    });
                }
            } catch (err) {
                console.error("❌ Lỗi khi tải thông tin bệnh nhân:", err);
                toast.error("Không thể tải thông tin cá nhân.");
            }
        };
        fetchProfile();
    }, []);

    // Khi thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    // Lưu thay đổi (PUT /user/me)
    const handleSave = async () => {
        try {
            const payload = {
                full_name: editData.full_name,
                dob: editData.dob,
                gender: editData.gender,
                address: editData.address,
            };
            const res = await profilePatientApi.updateInformation(payload);

            if (res.data.success) {
                setFormData(editData);
                setIsEditing(false);
                toast.success("Cập nhật thông tin thành công!");
            }
        } catch (err) {
            console.error("Lỗi cập nhật thông tin:", err);
            toast.error("Không thể cập nhật thông tin.");
        }
    };

    const handleCancel = () => {
        setEditData(formData);
        setIsEditing(false);
    };

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
                        {/* Họ tên */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Họ và tên</label>
                            <input
                                name="full_name"
                                value={editData.full_name}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>

                        {/* Ngày sinh */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Ngày sinh</label>
                            <input
                                type="date"
                                name="dob"
                                value={editData.dob}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>

                        {/* Giới tính */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Giới tính</label>
                            <select
                                name="gender"
                                value={editData.gender}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded-lg"
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        {/* Địa chỉ */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                            <input
                                name="address"
                                value={editData.address}
                                onChange={handleChange}
                                className="w-full border px-3 py-2 rounded-lg"
                            />
                        </div>
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
                    <div>
                        <p className="text-sm text-gray-500">Họ và tên</p>
                        <p className="font-semibold">{formData.full_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Ngày sinh</p>
                        <p className="font-semibold">{formData.dob}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Giới tính</p>
                        <p className="font-semibold">{formData.gender}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p className="font-semibold">{formData.address}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
