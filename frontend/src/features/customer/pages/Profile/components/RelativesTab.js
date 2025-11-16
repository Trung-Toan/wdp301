import React, { useEffect, useState } from "react";
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Calendar,
    User,
    Loader2,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { relativesApi } from "../../../../../api/patients/relativesApi";

export default function RelativesTab() {
    const [relatives, setRelatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRelative, setSelectedRelative] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        dob: "",
        gender: "MALE",
        province_code: "",
        ward_code: "",
        address: "",
        relationship: "",
    });
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Fetch relatives list
    const fetchRelatives = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await relativesApi.getRelatives({ page: 1, limit: 100 });
            setRelatives(response.data?.data || []);
        } catch (err) {
            setError(err.message || "Lỗi khi tải danh sách người thân");
            toast.error("Không thể tải danh sách người thân");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRelatives();
    }, []);

    // Load provinces
    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const { provinceApi } = await import("../../../../../api/address/provinceApi");
                const res = await provinceApi.getProvinces();
                setProvinces(res.data?.options || []);
            } catch (err) {
                console.error("Error loading provinces:", err);
            }
        };
        if (showAddModal || showEditModal) {
            loadProvinces();
        }
    }, [showAddModal, showEditModal]);

    // Load wards when province changes
    useEffect(() => {
        const loadWards = async () => {
            if (!formData.province_code) {
                setWards([]);
                return;
            }
            try {
                const { wardApi } = await import("../../../../../api/address/wardApi");
                const res = await wardApi.getWardsByProvince(formData.province_code);
                setWards(res.data?.options || []);
            } catch (err) {
                console.error("Error loading wards:", err);
            }
        };
        loadWards();
    }, [formData.province_code]);

    const handleOpenAddModal = () => {
        setFormData({
            full_name: "",
            phone: "",
            email: "",
            dob: "",
            gender: "MALE",
            province_code: "",
            ward_code: "",
            address: "",
            relationship: "",
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (relative) => {
        setSelectedRelative(relative);
        setFormData({
            full_name: relative.full_name || "",
            phone: relative.phone || "",
            email: relative.email || "",
            dob: relative.dob ? new Date(relative.dob).toISOString().split("T")[0] : "",
            gender: relative.gender || "MALE",
            province_code: relative.province_code || "",
            ward_code: relative.ward_code || "",
            address: relative.address || "",
            relationship: relative.relationship || "",
        });
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedRelative(null);
        setFormData({
            full_name: "",
            phone: "",
            email: "",
            dob: "",
            gender: "MALE",
            province_code: "",
            ward_code: "",
            address: "",
            relationship: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (showEditModal && selectedRelative) {
                // Update relative
                await relativesApi.updateRelative(selectedRelative._id, formData);
                toast.success("Cập nhật thông tin người thân thành công!");
            } else {
                // Create relative
                await relativesApi.createRelative(formData);
                toast.success("Thêm người thân thành công!");
            }
            handleCloseModal();
            fetchRelatives();
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || "Có lỗi xảy ra";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (relativeId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người thân này?")) {
            return;
        }

        try {
            await relativesApi.deleteRelative(relativeId);
            toast.success("Xóa người thân thành công!");
            fetchRelatives();
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || "Không thể xóa người thân";
            toast.error(errorMessage);
        }
    };

    const getRelationshipText = (relationship) => {
        const map = {
            cha: "Cha",
            me: "Mẹ",
            con: "Con",
            vo_chong: "Vợ/Chồng",
            anh_chi_em: "Anh/Chị/Em",
            ban: "Bạn",
            khac: "Khác",
        };
        return map[relationship] || relationship;
    };

    const getGenderText = (gender) => {
        const map = {
            MALE: "Nam",
            FEMALE: "Nữ",
            OTHER: "Khác",
        };
        return map[gender] || gender;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
                <p className="mt-4 text-gray-600">Đang tải danh sách người thân...</p>
            </div>
        );
    }

    if (error && relatives.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="mt-4 text-red-600">{error}</p>
                <button
                    onClick={fetchRelatives}
                    className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        Quản lý người thân
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Quản lý danh sách người thân để đặt lịch khám nhanh chóng
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="h-5 w-5" />
                    Thêm người thân
                </button>
            </div>

            {/* Relatives List */}
            {relatives.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Chưa có người thân nào</p>
                    <p className="text-gray-500 text-sm mb-6">Thêm người thân để đặt lịch khám nhanh chóng</p>
                    <button
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all"
                    >
                        Thêm người thân đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatives.map((relative) => (
                        <div
                            key={relative._id}
                            className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-pink-300 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        {relative.full_name}
                                    </h3>
                                    <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">
                                        {getRelationshipText(relative.relationship)}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenEditModal(relative)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(relative._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                {relative.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span>{relative.phone}</span>
                                    </div>
                                )}
                                {relative.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span>{relative.email}</span>
                                    </div>
                                )}
                                {relative.dob && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span>
                                            {new Date(relative.dob).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>{getGenderText(relative.gender)}</span>
                                </div>
                                {relative.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="line-clamp-1">{relative.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {showEditModal ? "Chỉnh sửa người thân" : "Thêm người thân mới"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Họ tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                        value={formData.full_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, full_name: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Ngày sinh
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                        value={formData.dob}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dob: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Giới tính
                                    </label>
                                    <select
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                        value={formData.gender}
                                        onChange={(e) =>
                                            setFormData({ ...formData, gender: e.target.value })
                                        }
                                    >
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Mối quan hệ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                        value={formData.relationship}
                                        onChange={(e) =>
                                            setFormData({ ...formData, relationship: e.target.value })
                                        }
                                    >
                                        <option value="">-- Chọn mối quan hệ --</option>
                                        <option value="cha">Cha</option>
                                        <option value="me">Mẹ</option>
                                        <option value="con">Con</option>
                                        <option value="vo_chong">Vợ/Chồng</option>
                                        <option value="anh_chi_em">Anh/Chị/Em</option>
                                        <option value="ban">Bạn</option>
                                        <option value="khac">Khác</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Tỉnh/Thành phố
                                    </label>
                                    <select
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                        value={formData.province_code}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                province_code: e.target.value,
                                                ward_code: "",
                                            })
                                        }
                                    >
                                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                        {provinces.map((province) => (
                                            <option key={province.value} value={province.value}>
                                                {province.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">
                                        Phường/Xã
                                    </label>
                                    <select
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                        value={formData.ward_code}
                                        onChange={(e) =>
                                            setFormData({ ...formData, ward_code: e.target.value })
                                        }
                                        disabled={!formData.province_code}
                                    >
                                        <option value="">-- Chọn Phường/Xã --</option>
                                        {wards.map((ward) => (
                                            <option key={ward.value} value={ward.value}>
                                                {ward.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-gray-700">
                                    Địa chỉ chi tiết
                                </label>
                                <input
                                    type="text"
                                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5" />
                                            {showEditModal ? "Cập nhật" : "Thêm mới"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

