import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Mail, FileText, Loader2, CheckCircle, AlertCircle, X, Stethoscope, Sparkles, CheckCircle2, LogIn, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useBooking } from "../../../hooks/useBooking";
import { clinicApi } from "../../../api/clinic/clinicApi";

export default function ClinicBookingForm({ clinic, onClose, onSuccess }) {
    const { user } = useAuth();
    const { createBooking, loading, error, success } = useBooking();

    // States
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState(null);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [locationWarning, setLocationWarning] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingSubmit, setPendingSubmit] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        doctor_id: "", // Empty = clinic will assign
        specialty_id: "",
        scheduled_date: "",
        slot_id: "",
        full_name: user?.full_name || user?.name || "",
        phone: user?.phone_number || "",
        email: user?.email || "",
        reason: "",
    });

    const [autoAssignDoctor, setAutoAssignDoctor] = useState(true);

    // Hàm lấy tỉnh/thành phố của bệnh nhân
    const getPatientProvince = () => {
        if (!user) {
            console.log("🔍 getPatientProvince: No user");
            return null;
        }
        
        console.log("🔍 getPatientProvince: Checking user data:", {
            hasPatient: !!user.patient,
            patientAddress: user.patient?.address,
            userAddress: user.address,
            fullUser: user
        });
        
        // Kiểm tra trong user.patient.address
        if (user.patient?.address?.province?.name) {
            console.log("✅ Found in user.patient.address.province.name:", user.patient.address.province.name);
            return user.patient.address.province.name;
        }
        
        // Kiểm tra trong user.address.province
        if (user.address?.province?.name) {
            console.log("✅ Found in user.address.province.name:", user.address.province.name);
            return user.address.province.name;
        }
        
        // Kiểm tra trong user.address (nếu là string)
        if (typeof user.address === 'string') {
            console.log("🔍 Checking user.address string:", user.address);
            // Cố gắng parse từ string
            const lowerAddress = user.address.toLowerCase();
            if (lowerAddress.includes('hồ chí minh') || lowerAddress.includes('hcm') || lowerAddress.includes('tp. hồ chí minh')) {
                console.log("✅ Parsed from string as HCM");
                return 'Thành phố Hồ Chí Minh';
            }
            if (lowerAddress.includes('hà nội') || lowerAddress.includes('hanoi')) {
                console.log("✅ Parsed from string as Hanoi");
                return 'Thành phố Hà Nội';
            }
        }
        
        // Kiểm tra trong sessionStorage - account, user, patient
        try {
            const storedAccount = sessionStorage.getItem("account");
            const storedUser = sessionStorage.getItem("user");
            const storedPatient = sessionStorage.getItem("patient");
            
            console.log("🔍 Checking sessionStorage:", {
                hasAccount: !!storedAccount,
                hasUser: !!storedUser,
                hasPatient: !!storedPatient
            });
            
            if (storedPatient) {
                const patient = JSON.parse(storedPatient);
                console.log("🔍 Parsed patient from storage:", patient);
                if (patient.address?.province?.name) {
                    console.log("✅ Found in sessionStorage patient.address.province.name:", patient.address.province.name);
                    return patient.address.province.name;
                }
            }
            
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                console.log("🔍 Parsed user from storage:", userData);
                if (userData.address?.province?.name) {
                    console.log("✅ Found in sessionStorage user.address.province.name:", userData.address.province.name);
                    return userData.address.province.name;
                }
                // Kiểm tra address string trong user
                if (typeof userData.address === 'string') {
                    const lowerAddress = userData.address.toLowerCase();
                    if (lowerAddress.includes('hồ chí minh') || lowerAddress.includes('hcm') || lowerAddress.includes('tp. hồ chí minh')) {
                        console.log("✅ Parsed from sessionStorage user string as HCM");
                        return 'Thành phố Hồ Chí Minh';
                    }
                    if (lowerAddress.includes('hà nội') || lowerAddress.includes('hanoi')) {
                        console.log("✅ Parsed from sessionStorage user string as Hanoi");
                        return 'Thành phố Hà Nội';
                    }
                }
            }
        } catch (e) {
            console.error("❌ Error parsing from sessionStorage:", e);
        }
        
        console.log("❌ getPatientProvince: No province found");
        return null;
    };

    // Kiểm tra cảnh báo địa điểm khi clinic thay đổi
    useEffect(() => {
        if (!clinic || !user) {
            setLocationWarning(null);
            return;
        }

        const clinicProvince = clinic.address?.province?.name || 
                               (typeof clinic.address?.province === 'string' ? clinic.address.province : null);
        const patientProvince = getPatientProvince();

        console.log("🔍 Location check:", {
            clinicProvince,
            patientProvince,
            clinicAddress: clinic.address
        });

        if (!clinicProvince || !patientProvince) {
            console.log("⚠️ Missing province data, hiding warning");
            setLocationWarning(null);
            return;
        }

        // Chuẩn hóa tên tỉnh/thành phố để so sánh
        const normalizeProvince = (province) => {
            const lower = province.toLowerCase().trim();
            // HCM
            if (lower.includes('hồ chí minh') || lower.includes('hcm') || lower.includes('tp. hồ chí minh') || 
                lower.includes('tp hồ chí minh') || lower === 'thành phố hồ chí minh' ||
                lower.includes('thành phố hồ chí minh')) {
                return 'HCM';
            }
            // Hà Nội
            if (lower.includes('hà nội') || lower.includes('hanoi') || lower === 'thành phố hà nội' ||
                lower.includes('thành phố hà nội')) {
                return 'Hanoi';
            }
            return lower;
        };

        const normalizedClinic = normalizeProvince(clinicProvince);
        const normalizedPatient = normalizeProvince(patientProvince);

        console.log("🔍 Normalized:", {
            clinic: normalizedClinic,
            patient: normalizedPatient,
            isDifferent: normalizedClinic !== normalizedPatient
        });

        // Nếu khác nhau, hiển thị cảnh báo
        if (normalizedClinic !== normalizedPatient) {
            const isCrossCity = (normalizedClinic === 'HCM' && normalizedPatient === 'Hanoi') || 
                               (normalizedClinic === 'Hanoi' && normalizedPatient === 'HCM');
            console.log("⚠️ Location warning detected:", {
                clinic: clinicProvince,
                patient: patientProvince,
                isCrossCity
            });
            setLocationWarning({
                clinic: clinicProvince,
                patient: patientProvince,
                isCrossCity
            });
        } else {
            setLocationWarning(null);
        }
    }, [clinic, user]);

    const loadDoctors = async () => {
        try {
            const response = await clinicApi.getClinicDoctors(clinic?.id || clinic?._id, {
                specialtyId: formData.specialty_id,
                limit: 100,
            });
            setDoctors(response.data.data);
        } catch (err) {
            console.error("Error loading doctors:", err);
        }
    };

    // Load doctors when specialty changes (for manual selection)
    useEffect(() => {
        if (!autoAssignDoctor && formData.specialty_id) {
            loadDoctors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.specialty_id, autoAssignDoctor]);

    const loadAvailableSlots = async () => {
        try {
            setLoadingSlots(true);
            // If auto-assign, get slots from any doctor in the clinic
            // For now, we'll get slots from first available doctor
            // Backend should handle this better
            if (autoAssignDoctor) {
                // Get any doctor from clinic
                const response = await clinicApi.getClinicDoctors(clinic?.id || clinic?._id, {
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

    // Load slots when doctor and date selected
    // NOTE: Khi autoAssignDoctor = true, slot không bắt buộc vì backend sẽ tự tìm
    useEffect(() => {
        if (formData.scheduled_date && !autoAssignDoctor && formData.doctor_id) {
            loadAvailableSlots();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.scheduled_date, formData.doctor_id, autoAssignDoctor]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra cảnh báo chéo thành phố và yêu cầu xác nhận
        if (locationWarning?.isCrossCity && !pendingSubmit) {
            setShowConfirmModal(true);
            return;
        }

        // Tiếp tục submit nếu đã xác nhận hoặc không có cảnh báo
        await performSubmit();
    };

    const performSubmit = async () => {
        try {
            setRequestLoading(true);
            setRequestError(null);
            setRequestSuccess(false);
            setShowConfirmModal(false);

            const bookingData = {
                clinic_id: clinic?.id || clinic?._id,
                specialty_id: formData.specialty_id,
                scheduled_date: formData.scheduled_date,
                patient_id: user?.patient?._id || user?._id,
                auto_assign: autoAssignDoctor,
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email,
                reason: formData.reason,
            };

            // If not auto-assign, add doctor_id and slot_id
            if (!autoAssignDoctor) {
                bookingData.doctor_id = formData.doctor_id;
                bookingData.slot_id = formData.slot_id;
            }

            console.log("📤 Booking data being sent:", bookingData);
            console.log("📋 Form validation check:");
            console.log("  - specialty_id:", formData.specialty_id || "❌ MISSING");
            console.log("  - scheduled_date:", formData.scheduled_date || "❌ MISSING");
            console.log("  - patient_id:", bookingData.patient_id || "❌ MISSING");
            console.log("  - auto_assign:", autoAssignDoctor);
            console.log("  - clinic_id:", bookingData.clinic_id || "❌ MISSING");

            let result;
            
            // Use clinic booking API when auto-assign is true, or use regular appointment API
            if (autoAssignDoctor) {
                const response = await clinicApi.createClinicBooking(bookingData);
                result = response.data.data;
            } else {
                // For manual booking, add clinic_id to appointment data
                bookingData.clinic_id = clinic?.id || clinic?._id;
                result = await createBooking(bookingData);
            }
            
            if (result) {
                setRequestSuccess(true);
                if (onSuccess) onSuccess(result);
            }
        } catch (err) {
            console.error("Booking error:", err);
            const errorMessage = err.response?.data?.error || "Đặt lịch thất bại. Vui lòng thử lại.";
            setRequestError(errorMessage);
            setPendingSubmit(false); // Reset để có thể thử lại
        } finally {
            setRequestLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    // Kiểm tra đăng nhập
    if (!user) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-white/50">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 text-white p-6 sm:p-8 rounded-t-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-purple-400/20"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-1 drop-shadow-lg">Đặt lịch khám</h2>
                                    <p className="text-white/90 text-sm font-medium">{clinic.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all transform hover:scale-110 active:scale-95"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Login Required Content */}
                    <div className="flex-1 overflow-y-auto p-8 sm:p-12">
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-sky-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-sky-400 to-blue-500 rounded-full p-6 shadow-2xl">
                                    <LogIn className="h-16 w-16 text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                                Đăng nhập để đặt lịch
                            </h3>
                            <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
                                Bạn cần đăng nhập để có thể đặt lịch khám tại phòng khám <strong className="text-gray-900">{clinic.name}</strong>. Vui lòng đăng nhập để tiếp tục.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/login"
                                    onClick={onClose}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                >
                                    <LogIn className="h-5 w-5" />
                                    Đăng nhập ngay
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold transform hover:scale-105 active:scale-95"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-white/50">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 text-white p-6 sm:p-8 rounded-t-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-purple-400/20"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-1 drop-shadow-lg">Đặt lịch khám</h2>
                                <p className="text-white/90 text-sm font-medium">{clinic.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all transform hover:scale-110 active:scale-95"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Confirmation Modal for Cross-City Booking */}
                {showConfirmModal && locationWarning?.isCrossCity && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-amber-300 animate-fadeIn">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20"></div>
                                <div className="relative flex items-center gap-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <AlertCircle className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">Xác nhận đặt lịch</h3>
                                        <p className="text-white/90 text-sm">Khoảng cách xa giữa hai thành phố</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-amber-900">
                                            <MapPin className="h-5 w-5" />
                                            <span className="font-semibold">Địa chỉ của bạn:</span>
                                            <span className="font-bold">{locationWarning.patient}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-amber-900">
                                            <MapPin className="h-5 w-5" />
                                            <span className="font-semibold">Địa chỉ phòng khám:</span>
                                            <span className="font-bold">{locationWarning.clinic}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                    <p className="text-blue-900 text-sm leading-relaxed">
                                        <strong className="font-bold">Lưu ý quan trọng:</strong> Khoảng cách giữa <strong>{locationWarning.patient}</strong> và <strong>{locationWarning.clinic}</strong> rất xa (hơn 1,700km). 
                                        Bạn có chắc chắn muốn tiếp tục đặt lịch không? Hãy đảm bảo bạn có thể sắp xếp thời gian và phương tiện di chuyển.
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setPendingSubmit(false);
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setPendingSubmit(true);
                                        setShowConfirmModal(false);
                                        await performSubmit();
                                    }}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    Xác nhận đặt lịch
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {(success || requestSuccess) && (
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                        <div className="text-center py-12">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-6 shadow-2xl">
                                    <CheckCircle2 className="h-16 w-16 text-white" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                                Đặt lịch thành công!
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                                Bạn sẽ nhận được thông báo xác nhận qua email và trong hệ thống. Vui lòng kiểm tra thông tin và đến đúng giờ hẹn.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                {/* Form */}
                {!(success || requestSuccess) && (
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                        {/* Doctor Selection Mode */}
                        <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50 border-2 border-sky-200 rounded-2xl p-5 hover:border-sky-300 transition-all shadow-sm">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div className="flex-shrink-0 mt-1">
                                    <input
                                        type="checkbox"
                                        checked={autoAssignDoctor}
                                        onChange={(e) => {
                                            setAutoAssignDoctor(e.target.checked);
                                            if (e.target.checked) {
                                                handleChange("doctor_id", "");
                                            }
                                        }}
                                        className="w-6 h-6 text-sky-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-5 w-5 text-sky-600" />
                                        <p className="font-bold text-gray-900 text-lg">
                                            Để phòng khám sắp xếp bác sĩ cho tôi
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Phòng khám sẽ tự động chọn bác sĩ phù hợp dựa trên chuyên khoa và lịch trống. Đây là cách nhanh nhất để đặt lịch!
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Location Warning */}
                        {locationWarning && (
                            <div className={`flex items-start gap-3 p-5 rounded-2xl shadow-sm border-2 ${
                                locationWarning.isCrossCity 
                                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300' 
                                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
                            }`}>
                                <div className={`flex-shrink-0 p-2 rounded-xl ${
                                    locationWarning.isCrossCity ? 'bg-amber-100' : 'bg-blue-100'
                                }`}>
                                    <AlertCircle className={`h-6 w-6 ${
                                        locationWarning.isCrossCity ? 'text-amber-600' : 'text-blue-600'
                                    }`} />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-bold mb-2 text-lg ${
                                        locationWarning.isCrossCity ? 'text-amber-900' : 'text-blue-900'
                                    }`}>
                                        {locationWarning.isCrossCity ? '⚠️ Cảnh báo khoảng cách' : 'ℹ️ Thông tin địa điểm'}
                                    </p>
                                    <p className={`text-sm leading-relaxed ${
                                        locationWarning.isCrossCity ? 'text-amber-800' : 'text-blue-800'
                                    }`}>
                                        {locationWarning.isCrossCity ? (
                                            <>
                                                Bạn đang ở <strong>{locationWarning.patient}</strong> nhưng đặt lịch khám tại phòng khám ở <strong>{locationWarning.clinic}</strong>. 
                                                Khoảng cách giữa hai thành phố rất xa, bạn có chắc chắn muốn tiếp tục đặt lịch không?
                                            </>
                                        ) : (
                                            <>
                                                Bạn đang ở <strong>{locationWarning.patient}</strong> và đặt lịch tại phòng khám ở <strong>{locationWarning.clinic}</strong>. 
                                                Vui lòng đảm bảo bạn có thể đến đúng giờ hẹn.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Specialty Selection */}
                        {clinic.specialties && clinic.specialties.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-sky-600" />
                                    Chuyên khoa <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.specialty_id}
                                        onChange={(e) => handleChange("specialty_id", e.target.value)}
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white font-medium appearance-none cursor-pointer hover:border-sky-300 transition-colors"
                                        required
                                    >
                                        <option value="">-- Chọn chuyên khoa --</option>
                                        {clinic.specialties.map((sp) => (
                                            <option key={sp.id} value={sp.id}>
                                                {sp.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Doctor Selection (if not auto-assign) */}
                        {!autoAssignDoctor && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4 text-sky-600" />
                                    Chọn bác sĩ <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.doctor_id}
                                        onChange={(e) => handleChange("doctor_id", e.target.value)}
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white font-medium appearance-none cursor-pointer hover:border-sky-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                {!formData.specialty_id && (
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Vui lòng chọn chuyên khoa trước
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Date Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-sky-600" />
                                Ngày khám <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.scheduled_date}
                                    onChange={(e) => handleChange("scheduled_date", e.target.value)}
                                    min={today}
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors cursor-pointer"
                                    required
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Time Slots - Chỉ hiện khi KHÔNG auto-assign */}
                        {formData.scheduled_date && !autoAssignDoctor && formData.doctor_id && (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-sky-600" />
                                    Giờ khám <span className="text-red-500">*</span>
                                </label>
                                {loadingSlots ? (
                                    <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border-2 border-sky-200">
                                        <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-3" />
                                        <p className="text-sm text-gray-600 font-medium">Đang tải khung giờ...</p>
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
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
                                                    className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold transform hover:scale-105 active:scale-95 ${
                                                        formData.slot_id === slotId
                                                            ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-500 shadow-lg"
                                                            : "border-gray-200 hover:border-sky-300 text-gray-700 hover:bg-sky-50 bg-white"
                                                    }`}
                                                >
                                                    {startTime}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 font-medium">Không có lịch trống trong ngày này</p>
                                        <p className="text-xs text-gray-500 mt-1">Vui lòng chọn ngày khác</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Auto-assign info */}
                        {formData.scheduled_date && autoAssignDoctor && (
                            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 p-2 bg-green-100 rounded-xl">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-green-900 mb-2 text-lg">
                                            Phòng khám sẽ tự động sắp xếp
                                        </p>
                                        <p className="text-sm text-green-700 leading-relaxed">
                                            Sau khi xác nhận, phòng khám sẽ chọn bác sĩ và khung giờ phù hợp nhất cho bạn vào ngày <strong className="font-semibold">{new Date(formData.scheduled_date).toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Patient Info */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <User className="h-5 w-5 text-sky-600" />
                                </div>
                                Thông tin bệnh nhân
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-sky-600" />
                                        Họ tên <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => handleChange("full_name", e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors"
                                            placeholder="Nhập họ và tên"
                                            required
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-sky-600" />
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors"
                                            placeholder="0123456789"
                                            required
                                        />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-sky-600" />
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium hover:border-sky-300 transition-colors"
                                            placeholder="email@example.com"
                                            required
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-sky-600" />
                                Lý do khám <span className="text-gray-500 font-normal text-xs">(tùy chọn)</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => handleChange("reason", e.target.value)}
                                    placeholder="Mô tả triệu chứng hoặc lý do khám bệnh của bạn..."
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none font-medium hover:border-sky-300 transition-colors"
                                    rows="4"
                                />
                                <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Error */}
                        {(error || requestError) && (
                            <div className="flex items-start gap-3 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-700 rounded-2xl shadow-sm">
                                <div className="flex-shrink-0 p-1.5 bg-red-100 rounded-lg">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold mb-1">Có lỗi xảy ra</p>
                                    <span className="text-sm">{error || requestError}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading || requestLoading}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {(loading || requestLoading) ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
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

