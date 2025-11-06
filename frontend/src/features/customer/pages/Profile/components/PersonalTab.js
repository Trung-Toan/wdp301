import React, { useState, useEffect } from "react";
import { Edit2, Save, X, User, Calendar, Users, MapPin, Building2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { profilePatientApi } from "../../../../../api/patients/profilePatientApi";
import { provinceApi } from "../../../../../api/address/provinceApi";
import { wardApi } from "../../../../../api/address/wardApi";

export default function PersonalTab() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        dob: "",
        gender: "",
        address: "",
        email: "",
        phone_number: "",
        provinceCode: "",
        wardCode: "",
    });
    const [editData, setEditData] = useState({
        full_name: "",
        dob: "",
        gender: "",
        address: "",
        email: "",
        phone_number: "",
        provinceCode: "",
        wardCode: "",
    });
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await provinceApi.getProvinces();
                if (res.data?.options) {
                    const provinceList = res.data.options.map(p => ({
                        value: p.value,
                        label: p.label
                    }));
                    setProvinces(provinceList);
                }
            } catch (err) {
                console.error("Lỗi tải tỉnh:", err);
            }
        };
        fetchProvinces();
    }, []);

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
                        try {
                            setLoadingWards(true);
                            const wardRes = await wardApi.getWardsByProvince(data.province_code);

                            const rawWards = wardRes.data?.data || wardRes.data?.options || [];
                            const wardList = rawWards.map(w => ({
                                value: w.code || w.value,
                                label: w.name || w.label
                            }));
                            setWards(wardList);
                        } catch (err) {
                            console.error("Lỗi tải quận/huyện khi load profile:", err);
                        } finally {
                            setLoadingWards(false);
                        }
                    }
                }
            } catch (err) {
                console.error("Lỗi tải thông tin bệnh nhân:", err);
                toast.error("Không thể tải thông tin cá nhân.");
            }
        };
        fetchProfile();
    }, []);

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
        setLoadingWards(true);

        if (!provinceCode) {
            setLoadingWards(false);
            return;
        }

        try {
            const res = await wardApi.getWardsByProvince(provinceCode);

            const rawWards = res.data?.data || res.data?.options || [];
            const wardList = rawWards.map(w => ({
                value: w.code || w.value,
                label: w.name || w.label
            }));
            setWards(wardList);
        } catch (err) {
            console.error("Lỗi tải quận/huyện:", err);
            toast.error("Không thể tải danh sách quận/huyện.");
        } finally {
            setLoadingWards(false);
        }
    };


    const handleCancel = async () => {
        setEditData(formData);
        setIsEditing(false);
        setLoadingWards(true);
        try {
            if (formData.provinceCode) {
                const res = await wardApi.getWardsByProvince(formData.provinceCode);

                const rawWards = res.data?.data || res.data?.options || [];
                const wardList = rawWards.map(w => ({
                    value: w.code || w.value,
                    label: w.name || w.label
                }));
                setWards(wardList);
            } else {
                setWards([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải lại wards lúc hủy:", err);
            setWards([]);
        } finally {
            setLoadingWards(false);
        }
    };

    const getProvinceName = (code) => provinces.find(p => p.value === code)?.label || "";
    const getWardName = (code) => wards.find(w => w.value === code)?.label || "";

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const payload = {
                full_name: editData.full_name,
                dob: editData.dob,
                gender: editData.gender,
                address: editData.address,
                province_code: editData.provinceCode,
                ward_code: editData.wardCode,
            };
            const res = await profilePatientApi.updateInformation(payload);
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
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl">
                        <User className="h-6 w-6 text-sky-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Thông tin cá nhân</h2>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                        <Edit2 size={18} />
                        Chỉnh sửa
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Họ và tên */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-sky-600" />
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    name="full_name"
                                    value={editData.full_name || ""}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors"
                                    placeholder="Nhập họ và tên"
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Ngày sinh */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-sky-600" />
                                Ngày sinh
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="dob"
                                    value={editData.dob || ""}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors cursor-pointer"
                                />
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Giới tính */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4 text-sky-600" />
                                Giới tính
                            </label>
                            <div className="relative">
                                <select
                                    name="gender"
                                    value={editData.gender || ""}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors appearance-none cursor-pointer bg-white"
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-sky-600" />
                                Địa chỉ
                            </label>
                            <div className="relative">
                                <input
                                    name="address"
                                    value={editData.address || ""}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors"
                                    placeholder="Nhập địa chỉ"
                                />
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Tỉnh/Thành phố */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-sky-600" />
                                Tỉnh/Thành phố
                            </label>
                            <div className="relative">
                                <select
                                    name="provinceCode"
                                    value={editData.provinceCode || ""}
                                    onChange={handleProvinceChange}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors appearance-none cursor-pointer bg-white"
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Quận/Huyện */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-sky-600" />
                                Quận/Huyện
                            </label>
                            <div className="relative">
                                <select
                                    name="wardCode"
                                    value={editData.wardCode || ""}
                                    onChange={(e) => setEditData(prev => ({ ...prev, wardCode: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors appearance-none cursor-pointer bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!wards.length}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {wards.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                                </select>
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                            {loadingWards && editData.provinceCode && (
                                <p className="text-xs text-sky-600 mt-2 flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Đang tải danh sách quận/huyện...
                                </p>
                            )}
                            {!loadingWards && !wards.length && editData.provinceCode && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                    <span>⚠️</span>
                                    Không tìm thấy quận/huyện nào
                                </p>
                            )}
                            {!editData.provinceCode && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <span>ℹ️</span>
                                    Vui lòng chọn tỉnh/thành phố trước
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={18} className="inline mr-2" />
                            Hủy
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-sky-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Họ và tên</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{formData.full_name || "Chưa cập nhật"}</p>
                    </div>

                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-sky-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Ngày sinh</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">
                            {formData.dob ? new Date(formData.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-sky-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Giới tính</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{formData.gender || "Chưa cập nhật"}</p>
                    </div>

                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-sky-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Địa chỉ</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{formData.address || "Chưa cập nhật"}</p>
                    </div>

                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-sky-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Tỉnh/Thành phố</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{getProvinceName(formData.provinceCode) || "Chưa cập nhật"}</p>
                    </div>

                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-sky-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Quận/Huyện</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{getWardName(formData.wardCode) || "Chưa cập nhật"}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
