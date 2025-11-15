import React, { useState, useEffect } from "react";
import { Edit2, Save, X, Droplet, AlertTriangle, Heart, Pill, Scissors, Plus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { profilePatientApi } from "../../../../../api/patients/profilePatientApi";

export default function MedicalInfoTab() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        blood_type: "",
        allergies: [],
        chronic_diseases: [],
        medications: [],
        surgery_history: [],
    });
    const [editData, setEditData] = useState({
        blood_type: "",
        allergies: [],
        chronic_diseases: [],
        medications: [],
        surgery_history: [],
    });
    const [newItem, setNewItem] = useState({
        allergies: "",
        chronic_diseases: "",
        medications: "",
        surgery_history: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await profilePatientApi.getInformation();
                console.log("API profile response:", res.data);
                if (res.data?.success) {
                    const data = res.data.data;
                    const initialData = {
                        blood_type: data.blood_type || "",
                        allergies: Array.isArray(data.allergies) ? data.allergies : [],
                        chronic_diseases: Array.isArray(data.chronic_diseases) ? data.chronic_diseases : [],
                        medications: Array.isArray(data.medications) ? data.medications : [],
                        surgery_history: Array.isArray(data.surgery_history) ? data.surgery_history : [],
                    };
                    setFormData(initialData);
                    setEditData(initialData);
                    console.log("Initial medical data:", initialData);
                }
            } catch (err) {
                console.error("Lỗi tải thông tin y tế:", err);
                toast.error("Không thể tải thông tin y tế.");
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = (field) => {
        const value = newItem[field]?.trim();
        if (!value) {
            toast.warning("Vui lòng nhập thông tin trước khi thêm.");
            return;
        }
        setEditData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), value]
        }));
        setNewItem(prev => ({ ...prev, [field]: "" }));
    };

    const handleRemoveItem = (field, index) => {
        setEditData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleCancel = () => {
        setEditData(formData);
        setIsEditing(false);
        setNewItem({
            allergies: "",
            chronic_diseases: "",
            medications: "",
            surgery_history: "",
        });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const payload = {
                blood_type: editData.blood_type || undefined,
                allergies: editData.allergies,
                chronic_diseases: editData.chronic_diseases,
                medications: editData.medications,
                surgery_history: editData.surgery_history,
            };
            const res = await profilePatientApi.updateInformation(payload);
            if (res.data?.success) {
                setFormData(editData);
                setIsEditing(false);
                toast.success("Cập nhật thông tin y tế thành công!");
            } else {
                toast.error(res.data?.message || "Cập nhật thất bại.");
            }
        } catch (err) {
            console.error("Lỗi cập nhật thông tin y tế:", err);
            toast.error("Không thể cập nhật thông tin y tế.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-5 sm:p-6 border border-white/50">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                        <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Thông tin y tế</h2>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm"
                    >
                        <Edit2 size={16} />
                        Chỉnh sửa
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    {/* Nhóm máu */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Droplet className="h-4 w-4 text-red-600" />
                            Nhóm máu
                        </label>
                        <div className="relative">
                            <select
                                name="blood_type"
                                value={editData.blood_type || ""}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors appearance-none cursor-pointer bg-white text-sm"
                            >
                                <option value="">Chọn nhóm máu</option>
                                {bloodTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Dị ứng */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            Dị ứng
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newItem.allergies}
                                onChange={(e) => setNewItem(prev => ({ ...prev, allergies: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddItem('allergies')}
                                className="flex-1 pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors text-sm"
                                placeholder="Nhập dị ứng (ví dụ: Penicillin, Nuts)"
                            />
                            <button
                                onClick={() => handleAddItem('allergies')}
                                className="px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {editData.allergies.map((item, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg border border-red-200 text-sm"
                                >
                                    {item}
                                    <button
                                        onClick={() => handleRemoveItem('allergies', index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Bệnh mãn tính */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-600" />
                            Bệnh mãn tính
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newItem.chronic_diseases}
                                onChange={(e) => setNewItem(prev => ({ ...prev, chronic_diseases: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddItem('chronic_diseases')}
                                className="flex-1 pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors text-sm"
                                placeholder="Nhập bệnh mãn tính (ví dụ: Tiểu đường, Cao huyết áp)"
                            />
                            <button
                                onClick={() => handleAddItem('chronic_diseases')}
                                className="px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {editData.chronic_diseases.map((item, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-200 text-sm"
                                >
                                    {item}
                                    <button
                                        onClick={() => handleRemoveItem('chronic_diseases', index)}
                                        className="text-orange-600 hover:text-orange-800"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Thuốc đang dùng */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Pill className="h-4 w-4 text-blue-600" />
                            Thuốc đang dùng
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newItem.medications}
                                onChange={(e) => setNewItem(prev => ({ ...prev, medications: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddItem('medications')}
                                className="flex-1 pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors text-sm"
                                placeholder="Nhập thuốc đang dùng (ví dụ: Aspirin, Metformin)"
                            />
                            <button
                                onClick={() => handleAddItem('medications')}
                                className="px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {editData.medications.map((item, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-sm"
                                >
                                    {item}
                                    <button
                                        onClick={() => handleRemoveItem('medications', index)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tiền sử phẫu thuật */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Scissors className="h-4 w-4 text-purple-600" />
                            Tiền sử phẫu thuật
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newItem.surgery_history}
                                onChange={(e) => setNewItem(prev => ({ ...prev, surgery_history: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddItem('surgery_history')}
                                className="flex-1 pl-3 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors text-sm"
                                placeholder="Nhập tiền sử phẫu thuật (ví dụ: Phẫu thuật ruột thừa 2020)"
                            />
                            <button
                                onClick={() => handleAddItem('surgery_history')}
                                className="px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {editData.surgery_history.map((item, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg border border-purple-200 text-sm"
                                >
                                    {item}
                                    <button
                                        onClick={() => handleRemoveItem('surgery_history', index)}
                                        className="text-purple-600 hover:text-purple-800"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            <X size={16} className="inline mr-2" />
                            Hủy
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {/* Nhóm máu */}
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Droplet className="h-4 w-4 text-red-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Nhóm máu</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{formData.blood_type || "Chưa cập nhật"}</p>
                    </div>

                    {/* Dị ứng */}
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-1.5">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Dị ứng</p>
                        </div>
                        {formData.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {formData.allergies.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 rounded-md border border-red-200 text-xs font-medium"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-gray-900">Chưa cập nhật</p>
                        )}
                    </div>

                    {/* Bệnh mãn tính */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Heart className="h-4 w-4 text-red-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Bệnh mãn tính</p>
                        </div>
                        {formData.chronic_diseases.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {formData.chronic_diseases.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md border border-orange-200 text-xs font-medium"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-gray-900">Chưa cập nhật</p>
                        )}
                    </div>

                    {/* Thuốc đang dùng */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Pill className="h-4 w-4 text-blue-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Thuốc đang dùng</p>
                        </div>
                        {formData.medications.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {formData.medications.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md border border-blue-200 text-xs font-medium"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-gray-900">Chưa cập nhật</p>
                        )}
                    </div>

                    {/* Tiền sử phẫu thuật */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Scissors className="h-4 w-4 text-purple-600" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">Tiền sử phẫu thuật</p>
                        </div>
                        {formData.surgery_history.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {formData.surgery_history.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md border border-purple-200 text-xs font-medium"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-gray-900">Chưa cập nhật</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

