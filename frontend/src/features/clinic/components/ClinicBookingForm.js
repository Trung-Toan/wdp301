import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Mail, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useBooking } from "../../../hooks/useBooking";
import { clinicApi } from "../../../api/clinic/clinicApi";

export default function ClinicBookingForm({ clinic, onClose, onSuccess }) {
    const { user } = useAuth();
    const { createBooking, loading, error, success } = useBooking();

    // States
    const [step, setStep] = useState(1); // 1: Info, 2: Date/Time, 3: Confirm
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        doctor_id: "", // Empty = clinic will assign
        specialty_id: "",
        scheduled_date: "",
        slot_id: "",
        full_name: user?.full_name || "",
        phone: user?.phone || "",
        email: user?.email || "",
        reason: "",
    });

    const [autoAssignDoctor, setAutoAssignDoctor] = useState(true);

    // Load doctors when specialty changes (for manual selection)
    useEffect(() => {
        if (!autoAssignDoctor && formData.specialty_id) {
            loadDoctors();
        }
    }, [formData.specialty_id, autoAssignDoctor]);

    // Load slots when doctor and date selected
    // NOTE: Khi autoAssignDoctor = true, slot không bắt buộc vì backend sẽ tự tìm
    useEffect(() => {
        if (formData.scheduled_date && !autoAssignDoctor && formData.doctor_id) {
            loadAvailableSlots();
        }
    }, [formData.scheduled_date, formData.doctor_id, autoAssignDoctor]);

    const loadDoctors = async () => {
        try {
            const response = await clinicApi.getClinicDoctors(clinic._id, {
                specialtyId: formData.specialty_id,
                limit: 100,
            });
            setDoctors(response.data.data);
        } catch (err) {
            console.error("Error loading doctors:", err);
        }
    };

    const loadAvailableSlots = async () => {
        try {
            setLoadingSlots(true);
            // If auto-assign, get slots from any doctor in the clinic
            // For now, we'll get slots from first available doctor
            // Backend should handle this better
            if (autoAssignDoctor) {
                // Get any doctor from clinic
                const response = await clinicApi.getClinicDoctors(clinic._id, {
                    specialtyId: formData.specialty_id,
                    limit: 1,
                });
                if (response.data.data.length > 0) {
                    const firstDoctor = response.data.data[0];
                    const doctorId = firstDoctor._id || firstDoctor.id;
                    // Get slots for this doctor as reference
                    // Note: In production, backend should aggregate all clinic slots
                    const slotsResponse = await fetch(
                        `/api/appointments/doctors/${doctorId}/slots/available?date=${formData.scheduled_date}`
                    );
                    const slotsData = await slotsResponse.json();
                    setAvailableSlots(slotsData.data || []);
                }
            } else if (formData.doctor_id) {
                // Get slots for specific doctor
                const response = await fetch(
                    `/api/appointments/doctors/${formData.doctor_id}/slots/available?date=${formData.scheduled_date}`
                );
                const data = await response.json();
                setAvailableSlots(data.data || []);
            }
        } catch (err) {
            console.error("Error loading slots:", err);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const bookingData = {
            ...formData,
            clinic_id: clinic._id,
            patient_id: user?.patient?._id || user?._id,
            // If auto-assign, don't send doctor_id and slot_id (backend will auto-assign)
            doctor_id: autoAssignDoctor ? undefined : formData.doctor_id,
            slot_id: autoAssignDoctor ? undefined : formData.slot_id,
        };

        const result = await createBooking(bookingData);
        
        if (result) {
            if (onSuccess) onSuccess(result);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-sky-500 to-blue-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Đặt lịch khám</h2>
                            <p className="text-sky-100">{clinic.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                        >
                            <span className="text-2xl">×</span>
                        </button>
                    </div>
                </div>

                {/* Success State */}
                {success && (
                    <div className="p-6">
                        <div className="text-center py-8">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Đặt lịch thành công!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Bạn sẽ nhận được thông báo xác nhận qua email và trong hệ thống.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-medium"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                {/* Form */}
                {!success && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Doctor Selection Mode */}
                        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-sky-200 rounded-xl p-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoAssignDoctor}
                                    onChange={(e) => {
                                        setAutoAssignDoctor(e.target.checked);
                                        if (e.target.checked) {
                                            handleChange("doctor_id", "");
                                        }
                                    }}
                                    className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                        🏥 Để phòng khám sắp xếp bác sĩ cho tôi
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Phòng khám sẽ tự động chọn bác sĩ phù hợp dựa trên chuyên khoa và lịch trống
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Specialty Selection */}
                        {clinic.specialties && clinic.specialties.length > 0 && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Chuyên khoa {!autoAssignDoctor && <span className="text-red-500">*</span>}
                                </label>
                                <select
                                    value={formData.specialty_id}
                                    onChange={(e) => handleChange("specialty_id", e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                    required={!autoAssignDoctor}
                                >
                                    <option value="">-- Chọn chuyên khoa --</option>
                                    {clinic.specialties.map((sp) => (
                                        <option key={sp.id} value={sp.id}>
                                            {sp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Doctor Selection (if not auto-assign) */}
                        {!autoAssignDoctor && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Chọn bác sĩ <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.doctor_id}
                                    onChange={(e) => handleChange("doctor_id", e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                    required
                                    disabled={!formData.specialty_id}
                                >
                                    <option value="">-- Chọn bác sĩ --</option>
                                    {doctors.map((doctor) => {
                                        const doctorId = doctor._id || doctor.id;
                                        return (
                                            <option key={doctorId} value={doctorId}>
                                                {doctor.title} {doctor.user?.full_name}
                                            </option>
                                        );
                                    })}
                                </select>
                                {!formData.specialty_id && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Vui lòng chọn chuyên khoa trước
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Date Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Ngày khám <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.scheduled_date}
                                onChange={(e) => handleChange("scheduled_date", e.target.value)}
                                min={today}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                required
                            />
                        </div>

                        {/* Time Slots - Chỉ hiện khi KHÔNG auto-assign */}
                        {formData.scheduled_date && !autoAssignDoctor && formData.doctor_id && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    <Clock className="inline h-4 w-4 mr-1" />
                                    Giờ khám <span className="text-red-500">*</span>
                                </label>
                                {loadingSlots ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {availableSlots.map((slot) => {
                                            const slotId = slot._id || slot.id;
                                            const startTime = new Date(slot.start_time).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            });
                                            return (
                                                <button
                                                    key={slotId}
                                                    type="button"
                                                    onClick={() => handleChange("slot_id", slotId)}
                                                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                                        formData.slot_id === slotId
                                                            ? "bg-sky-500 text-white border-sky-500"
                                                            : "border-gray-200 hover:border-sky-300 text-gray-700"
                                                    }`}
                                                >
                                                    {startTime}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl">
                                        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Không có lịch trống</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Auto-assign info */}
                        {formData.scheduled_date && autoAssignDoctor && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-green-900 mb-1">
                                            Phòng khám sẽ tự động sắp xếp
                                        </p>
                                        <p className="text-sm text-green-700">
                                            Sau khi xác nhận, phòng khám sẽ chọn bác sĩ và khung giờ phù hợp nhất cho bạn vào ngày <strong>{new Date(formData.scheduled_date).toLocaleDateString("vi-VN")}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Patient Info */}
                        <div className="border-t pt-6">
                            <h3 className="font-bold text-gray-900 mb-4">Thông tin bệnh nhân</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        <User className="inline h-4 w-4 mr-1" />
                                        Họ tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => handleChange("full_name", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        <Phone className="inline h-4 w-4 mr-1" />
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        <Mail className="inline h-4 w-4 mr-1" />
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                <FileText className="inline h-4 w-4 mr-1" />
                                Lý do khám (tùy chọn)
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => handleChange("reason", e.target.value)}
                                placeholder="Mô tả triệu chứng hoặc lý do khám bệnh..."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                                rows="3"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="h-5 w-5" />
                                        Xác nhận đặt lịch
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

