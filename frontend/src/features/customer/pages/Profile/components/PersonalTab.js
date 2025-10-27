import React, { useState, useEffect } from "react";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import { profilePatientApi } from "../../../../../api/patients/profilePatientApi";
import { provinceApi } from "../../../../../api/address/provinceApi";
import { wardApi } from "../../../../../api/address/wardApi";

export default function PersonalTabDebug() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [editData, setEditData] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);

    // ==============================
    // Debug log function
    const logState = () => {
        console.log("===== Debug State =====");
        console.log("formData:", formData);
        console.log("editData:", editData);
        console.log("provinces:", provinces);
        console.log("wards:", wards);
        console.log("=======================");
    };
    useEffect(() => {
        logState();
    }, [formData, editData, provinces, wards]);

    // ==============================
    // Load provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await provinceApi.getProvinces();
                console.log("API provinces response:", res.data);
                if (res.data?.options) {
                    const provinceList = res.data.options.map(p => ({
                        value: p.value,
                        label: p.label
                    }));
                    setProvinces(provinceList);
                    console.log("Mapped provinces:", provinceList);
                }
            } catch (err) {
                console.error("Lỗi tải tỉnh:", err);
            }
        };
        fetchProvinces();
    }, []);

    // ==============================
    // Load patient profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await profilePatientApi.getInformation();
                console.log("API profile response:", res.data);
                if (res.data?.success) {
                    const data = res.data.data;
                    const initialData = {
                        full_name: data.full_name || "",
                        dob: data.dob ? data.dob.split("T")[0] : "",
                        gender: data.gender || "",
                        address: data.address || "",
                        email: data.account?.email || "",
                        phone_number: data.account?.phone_number || "",
                        provinceCode: data.province_code || "",
                        wardCode: data.ward_code || "",
                    };
                    setFormData(initialData);
                    setEditData(initialData);
                    console.log("Initial formData:", initialData);

                    // Load wards nếu provinceCode có sẵn
                    // Khi load profile
                    if (data.province_code) {
                        const wardRes = await wardApi.getWardsByProvince(data.province_code);
                        console.log("API wards response:", wardRes.data);

                        const rawWards = wardRes.data?.data || wardRes.data?.options || [];
                        const wardList = rawWards.map(w => ({
                            value: w.code || w.value,
                            label: w.name || w.label
                        }));
                        setWards(wardList);
                        console.log("Mapped wards:", wardList);
                    }
                }
            } catch (err) {
                console.error("Lỗi tải thông tin bệnh nhân:", err);
                toast.error("Không thể tải thông tin cá nhân.");
            }
        };
        fetchProfile();
    }, []);

    // ==============================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => {
            const newData = { ...prev, [name]: value };
            console.log(`Changed ${name}:`, value, "New editData:", newData);
            return newData;
        });
    };

    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.value;
        setEditData(prev => ({ ...prev, provinceCode, wardCode: "" }));
        setWards([]);
        console.log("Selected provinceCode:", provinceCode);

        if (!provinceCode) return;

        try {
            const res = await wardApi.getWardsByProvince(provinceCode);
            console.log("API wards response on province change:", res.data);

            const rawWards = res.data?.data || res.data?.options || [];
            const wardList = rawWards.map(w => ({
                value: w.code || w.value,
                label: w.name || w.label
            }));
            setWards(wardList);
            console.log("Mapped wards:", wardList);
        } catch (err) {
            console.error("Lỗi tải quận/huyện:", err);
        }
    };

    const handleSave = async () => {
        console.log("Saving editData:", editData);
        try {
            const payload = {
                full_name: editData.full_name,
                dob: editData.dob,
                gender: editData.gender,
                address: editData.address,
                province_code: editData.provinceCode,
                ward_code: editData.wardCode,
            };
            console.log("Payload sent:", payload);
            const res = await profilePatientApi.updateInformation(payload);
            console.log("API update response:", res.data);
            if (res.data?.success) {
                setFormData(editData);
                setIsEditing(false);
                toast.success("Cập nhật thông tin thành công!");
            } else {
                toast.error(res.data?.message || "Cập nhật thất bại.");
            }
        } catch (err) {
            console.error("Lỗi cập nhật thông tin:", err);
            toast.error("Không thể cập nhật thông tin.");
        }
    };

    const handleCancel = () => {
        setEditData(formData);
        setIsEditing(false);
        console.log("Edit cancelled, reset editData to formData");
    };

    const getProvinceName = (code) => provinces.find(p => p.value === code)?.label || "";
    const getWardName = (code) => wards.find(w => w.value === code)?.label || "";

    return (
        <div className="p-6 border rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Thông tin cá nhân (Debug)</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="border px-4 py-2 rounded-md flex items-center gap-2">
                        <Edit2 size={16} /> Chỉnh sửa
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label>Họ và tên</label>
                            <input name="full_name" value={editData.full_name || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                        </div>
                        <div>
                            <label>Ngày sinh</label>
                            <input type="date" name="dob" value={editData.dob || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                        </div>
                        <div>
                            <label>Giới tính</label>
                            <select name="gender" value={editData.gender || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg">
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label>Địa chỉ</label>
                            <input name="address" value={editData.address || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
                        </div>
                        <div>
                            <label>Tỉnh/Thành phố</label>
                            <select name="provinceCode" value={editData.provinceCode || ""} onChange={handleProvinceChange} className="w-full border px-3 py-2 rounded-lg">
                                <option value="">Chọn tỉnh/thành phố</option>
                                {provinces.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Quận/Huyện</label>
                            <select name="wardCode" value={editData.wardCode || ""} onChange={(e) => setEditData(prev => ({ ...prev, wardCode: e.target.value }))} className="w-full border px-3 py-2 rounded-lg" disabled={!wards.length}>
                                <option value="">Chọn quận/huyện</option>
                                {wards.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"><Save size={16} /> Lưu</button>
                        <button onClick={handleCancel} className="border px-4 py-2 rounded-md flex items-center gap-2"><X size={16} /> Hủy</button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    <div><p>Họ và tên:</p><p>{formData.full_name}</p></div>
                    <div><p>Ngày sinh:</p><p>{formData.dob}</p></div>
                    <div><p>Giới tính:</p><p>{formData.gender}</p></div>
                    <div><p>Địa chỉ:</p><p>{formData.address}</p></div>
                    <div><p>Tỉnh/Thành phố:</p><p>{getProvinceName(formData.provinceCode)}</p></div>
                    <div><p>Quận/Huyện:</p><p>{getWardName(formData.wardCode)}</p></div>
                </div>
            )}
        </div>
    );
}
