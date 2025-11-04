import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, User, FileText, ChevronLeft, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import BookingSuccess from "./bookingSuccess";
import { patientsApi } from "../../../../api/patients/patientsApi";
import { provinceApi } from "../../../../api/address/provinceApi";
import { wardApi } from "../../../../api/address/wardApi";
import { clinicApi } from "../../../../api/clinic/clinicApi";
const FILE_SERVER_URL = "http://localhost:5000/uploads";

// Helper function để xử lý URL ảnh
const getImageUrl = (url) => {
    if (!url) return null;
    // Nếu đã là URL đầy đủ (bắt đầu bằng http/https), trả về trực tiếp
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    // Nếu không, thêm FILE_SERVER_URL phía trước
    return `${FILE_SERVER_URL}/${url}`;
};

export function BookingContent() {
    const location = useLocation();
    const { selectedDate, selectedSlot, doctorName, specialty, hospital, price, doctorId, doctorAvatar, clinicId, doctor } = location.state || {};

    console.log("doctorAvatar:", doctorAvatar);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        gender: "male",
        province: "",
        ward: "",
        address: "",
        reason: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [bookingInfo, setBookingInfo] = useState(null);
    const [patientId, setPatientId] = useState(null);

    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    
    // Location warning states
    const [locationWarning, setLocationWarning] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingSubmit, setPendingSubmit] = useState(false);
    const [clinicData, setClinicData] = useState(null);

    const [storedAccount] = useState(() => JSON.parse(sessionStorage.getItem("account") || "{}"));
    const [storedUser] = useState(() => JSON.parse(sessionStorage.getItem("user") || "{}"));
    const [storedPatient] = useState(() => JSON.parse(sessionStorage.getItem("patient") || "null"));

    // Fetch patient_id từ API nếu không có trong sessionStorage
    useEffect(() => {
        const fetchPatientId = async () => {
            // Nếu có storedPatient, dùng luôn
            if (storedPatient && typeof storedPatient === 'object' && Object.keys(storedPatient).length > 0) {
                const id = storedPatient._id || storedPatient.id;
                if (id) {
                    console.log("✅ Using patient_id from storedPatient:", id);
                    setPatientId(id);
                    return;
                }
            }

            // Nếu không có storedPatient nhưng có storedUser, dùng user._id làm fallback
            if (storedUser && typeof storedUser === 'object' && Object.keys(storedUser).length > 0) {
                const fallbackId = storedUser._id || storedUser.id;
                if (fallbackId) {
                    console.log("⚠️ No patient found, using user._id as fallback:", fallbackId);
                    setPatientId(fallbackId);
                    return;
                }
            }

            // Nếu không tìm thấy gì cả
            if (storedAccount?.id) {
                console.error("❌ Không tìm thấy patient_id trong sessionStorage!");
                console.error("❌ storedAccount:", storedAccount);
                console.error("❌ storedUser:", storedUser);
                console.error("❌ storedPatient:", storedPatient);
            }
        };
        fetchPatientId();
    }, [storedAccount, storedUser, storedPatient]);

    // Log để debug
    useEffect(() => {
        console.log("🔍 Debug patient data:", {
            patientId,
            storedPatient,
            storedUser,
            storedAccount
        });
    }, [patientId, storedPatient, storedUser, storedAccount]);


    // Load danh sách tỉnh
    useEffect(() => {
        async function fetchProvinces() {
            try {
                const res = await provinceApi.getProvinces();
                const data = res.data?.options || [];
                setProvinces(data);
            } catch (err) {
                console.error("Lỗi khi tải tỉnh:", err);
            }
        }
        fetchProvinces();
    }, []);

    // Load danh sách phường theo tỉnh
    useEffect(() => {
        if (!formData.province) {
            setWards([]);
            return;
        }
        async function fetchWards() {
            try {
                const res = await wardApi.getWardsByProvince(formData.province);
                const data = res.data?.options || [];
                setWards(data);
            } catch (err) {
                console.error("Lỗi khi tải phường:", err);
            }
        }
        fetchWards();
    }, [formData.province]);

    // Gán dữ liệu user vào form
    useEffect(() => {
        if (storedUser || storedAccount || storedPatient) {
            // Chuyển định dạng ngày nếu có
            let dobFormatted = "";
            if (storedUser?.dob) {
                const date = new Date(storedUser.dob);
                // Format thành yyyy-MM-dd
                dobFormatted = date.toISOString().split("T")[0];
            }

            // Convert gender từ format DB sang format form
            const convertGender = (gender) => {
                if (!gender) return "male";
                const genderLower = gender.toLowerCase();
                if (genderLower === "male" || genderLower === "nam") return "male";
                if (genderLower === "female" || genderLower === "nữ") return "female";
                if (genderLower === "other" || genderLower === "khác") return "other";
                return "male"; // default
            };

            // Lấy province code
            const provinceCode = 
                storedUser?.address?.province?.code || 
                storedUser?.province_code ||
                storedPatient?.address?.province?.code ||
                storedPatient?.province_code ||
                "";

            // Lấy ward code
            const wardCode = 
                storedUser?.address?.ward?.code ||
                storedUser?.ward_code ||
                storedPatient?.address?.ward?.code ||
                storedPatient?.ward_code ||
                "";

            // Lấy address text (địa chỉ chi tiết)
            // Nếu address là string, dùng luôn. Nếu là object, lấy houseNumber + street
            let addressText = "";
            if (storedUser?.address) {
                if (typeof storedUser.address === "string") {
                    addressText = storedUser.address;
                } else if (storedUser.address.houseNumber || storedUser.address.street) {
                    addressText = [
                        storedUser.address.houseNumber,
                        storedUser.address.street
                    ].filter(Boolean).join(", ");
                }
            }
            if (!addressText && storedPatient?.address) {
                if (typeof storedPatient.address === "string") {
                    addressText = storedPatient.address;
                } else if (storedPatient.address.houseNumber || storedPatient.address.street) {
                    addressText = [
                        storedPatient.address.houseNumber,
                        storedPatient.address.street
                    ].filter(Boolean).join(", ");
                }
            }
            if (!addressText && storedUser?.address_text) {
                addressText = storedUser.address_text;
            }
            if (!addressText && storedPatient?.address_text) {
                addressText = storedPatient.address_text;
            }

            setFormData(prev => ({
                ...prev,
                fullName: storedUser?.full_name || prev.fullName || "",
                phone: storedAccount?.phone_number || prev.phone || "",
                email: storedAccount?.email || prev.email || "",
                dateOfBirth: dobFormatted || prev.dateOfBirth || "",
                gender: convertGender(storedUser?.gender || storedPatient?.gender) || prev.gender || "male",
                province: provinceCode || prev.province || "",
                ward: wardCode || prev.ward || "",
                address: addressText || prev.address || "",
            }));
        }
    }, [storedUser, storedAccount, storedPatient]);

    // Fetch clinic data nếu có clinicId
    useEffect(() => {
        const fetchClinicData = async () => {
            if (clinicId) {
                try {
                    const response = await clinicApi.getClinicDetail(clinicId);
                    setClinicData(response.data?.data || null);
                } catch (err) {
                    console.error("Error fetching clinic data:", err);
                }
            }
        };
        fetchClinicData();
    }, [clinicId]);

    // Kiểm tra cảnh báo địa điểm
    useEffect(() => {
        // Hàm lấy tên tỉnh/thành phố từ province code (định nghĩa trong useEffect để tránh dependency issue)
        const getProvinceName = (provinceCode) => {
            if (!provinceCode) return null;
            const province = provinces.find(p => p.value === provinceCode);
            return province?.label || null;
        };

        if (!formData.province) {
            setLocationWarning(null);
            return;
        }

        const patientProvinceName = getProvinceName(formData.province);
        let clinicProvinceName = null;

        // Lấy địa chỉ clinic từ clinicData hoặc từ storedUser/patient
        if (clinicData?.address?.province?.name) {
            clinicProvinceName = clinicData.address.province.name;
        } else if (typeof clinicData?.address?.province === 'string') {
            clinicProvinceName = clinicData.address.province;
        }

        if (!patientProvinceName || !clinicProvinceName) {
            setLocationWarning(null);
            return;
        }

        console.log("🔍 Location check:", {
            patientProvince: patientProvinceName,
            clinicProvince: clinicProvinceName,
            clinicData: clinicData
        });

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

        const normalizedClinic = normalizeProvince(clinicProvinceName);
        const normalizedPatient = normalizeProvince(patientProvinceName);

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
                clinic: clinicProvinceName,
                patient: patientProvinceName,
                isCrossCity
            });
            setLocationWarning({
                clinic: clinicProvinceName,
                patient: patientProvinceName,
                isCrossCity
            });
        } else {
            setLocationWarning(null);
        }
    }, [formData.province, clinicData, provinces]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    // Xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSlot) {
            toast.error("Vui lòng chọn lịch khám", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }
        if (!formData.dateOfBirth) {
            toast.error("Vui lòng nhập ngày sinh", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }
        if (!formData.province) {
            toast.error("Vui lòng chọn Tỉnh/Thành phố", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }
        if (!formData.ward) {
            toast.error("Vui lòng chọn Phường/Xã", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        // Kiểm tra nếu không có patientId thì báo lỗi
        if (!patientId) {
            toast.error("Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.", {
                position: "top-center",
                autoClose: 4000,
            });
            return;
        }

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
            const genderMap = {
                "Nam": "MALE",
                "Nữ": "FEMALE",
                "Khác": "OTHER"
            };
            const apiGender = genderMap[formData.gender] || formData.gender.toUpperCase();

            // Lấy clinic_id từ nhiều nguồn (ưu tiên theo thứ tự)
            const finalClinicId = 
                selectedSlot.clinicId || 
                selectedSlot.clinic?._id || 
                selectedSlot.clinic_id || 
                clinicId || // từ location.state
                doctor?.clinic?._id || // từ doctor object trong state
                doctor?.clinic_id || // từ doctor object
                clinicData?._id || 
                null;

            if (!finalClinicId) {
                console.warn("⚠️ Warning: clinic_id is null. Appointment will be created without clinic.");
                console.warn("⚠️ Debug info:", {
                    selectedSlot_clinicId: selectedSlot.clinicId,
                    selectedSlot_clinic: selectedSlot.clinic,
                    selectedSlot_clinic_id: selectedSlot.clinic_id,
                    clinicId_from_location: clinicId,
                    doctor_clinic_id: doctor?.clinic_id,
                    doctor_clinic: doctor?.clinic,
                    clinicData_id: clinicData?._id,
                    doctorId: doctorId,
                });
            }

            const payload = {
                slot_id: selectedSlot.id,
                doctor_id: doctorId,
                patient_id: patientId,
                specialty_id: selectedSlot.specialtyId?.id || selectedSlot.specialtyId,
                clinic_id: finalClinicId, // Sử dụng clinic_id đã được xử lý
                full_name: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                dob: formData.dateOfBirth,
                gender: apiGender,
                province_code: formData.province,
                ward_code: formData.ward,
                address_text: formData.address,
                reason: formData.reason,
            };

            console.log("📤 Booking payload:", {
                slot_id: payload.slot_id,
                doctor_id: payload.doctor_id,
                patient_id: payload.patient_id,
                clinic_id: payload.clinic_id,
                clinic_id_source: finalClinicId ? "found" : "null",
            });

            setShowConfirmModal(false);
            console.log("📤 Đang gửi đặt lịch với patient_id:", patientId);
            const response = await patientsApi.createAppointment(payload);
            console.log("✅ Đặt lịch thành công!");
            
            // Hiển thị toast success
            toast.success("Đặt lịch khám thành công!", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            setBookingInfo(response.data);
            setIsSubmitted(true);
            setPendingSubmit(false);
        } catch (err) {
            console.error("❌ Lỗi khi đặt lịch:", err);
            setPendingSubmit(false);
            
            let errorMessage = "Đặt lịch thất bại. Vui lòng thử lại!";
            
            if (err.response) {
                console.error("🔍 Chi tiết lỗi từ API:", err.response.data);
                const errorData = err.response.data;
                
                // Xử lý thông báo lỗi từ API
                if (errorData.error) {
                    // Nếu có error message cụ thể
                    errorMessage = typeof errorData.error === 'string' 
                        ? errorData.error 
                        : errorData.error.message || errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.success === false && errorData.error) {
                    errorMessage = errorData.error;
                } else {
                    // Nếu không có message, dùng status code
                    const status = err.response.status;
                    switch (status) {
                        case 400:
                            errorMessage = "Thông tin đặt lịch không hợp lệ. Vui lòng kiểm tra lại!";
                            break;
                        case 401:
                            errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
                            break;
                        case 403:
                            errorMessage = "Bạn không có quyền thực hiện thao tác này!";
                            break;
                        case 404:
                            errorMessage = "Không tìm thấy thông tin. Vui lòng thử lại!";
                            break;
                        case 409:
                            // Nếu có error message từ API, dùng message đó, nếu không thì dùng message mặc định
                            errorMessage = errorData.error || "Lịch khám này đã được đặt. Vui lòng chọn lịch khác!";
                            break;
                        case 500:
                            errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau!";
                            break;
                        default:
                            errorMessage = `Lỗi không xác định (${status}). Vui lòng thử lại!`;
                    }
                }
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.request) {
                errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet!";
            }
            
            // Hiển thị toast error với message rõ ràng
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }

    };

    console.log("bookingInfo:", bookingInfo);
    if (isSubmitted && bookingInfo) return <BookingSuccess bookingInfo={bookingInfo} />;

    const sidebarInfo = {
        doctorName: doctorName || "Chưa có tên bác sĩ",
        specialty: specialty || "Chưa có chuyên khoa",
        hospital: hospital || "Chưa có phòng khám",
        location: hospital || "Chưa có phòng khám",
        date: selectedDate || "Chưa chọn ngày",
        time: selectedSlot?.time || "Chưa chọn giờ",
        price: price || "Chưa có giá",
        image: doctorAvatar || null,
    };

    if (!selectedSlot) return <p className="p-4">Vui lòng chọn lịch khám trước</p>;

    return (
        <>
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

        <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 max-w-7xl">
                <Link to={`/home/doctordetail/${doctorId}`}>
                    <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors mb-8 group">
                        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> 
                        <span className="font-medium">Quay lại</span>
                    </button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Đặt lịch khám bệnh</h2>
                            <p className="text-gray-600 text-lg">Vui lòng điền đầy đủ thông tin để hoàn tất đặt lịch</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
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

                            {/* Thông tin cá nhân */}
                            <div className="space-y-6 p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                                <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <User className="h-5 w-5 text-white" /> 
                                    </div>
                                    Thông tin bệnh nhân
                                </h3>

                                {/* Họ tên và SĐT */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                            value={formData.fullName}
                                            onChange={e => handleChange("fullName", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-semibold text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                            value={formData.phone}
                                            onChange={e => handleChange("phone", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email và Ngày sinh */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-semibold text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                            value={formData.email}
                                            onChange={e => handleChange("email", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-semibold text-gray-700">Ngày sinh <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                            value={formData.dateOfBirth}
                                            onChange={e => handleChange("dateOfBirth", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Giới tính */}
                                <div>
                                    <label className="block mb-3 font-semibold text-gray-700">Giới tính <span className="text-red-500">*</span></label>
                                    <div className="flex gap-6">
                                        {["Nam", "Nữ", "Khác"].map(g => (
                                            <label key={g} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    value={g}
                                                    checked={formData.gender === g}
                                                    onChange={e => handleChange("gender", e.target.value)}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">
                                                    {g === "Nam" ? "Nam" : g === "Nữ" ? "Nữ" : "Khác"}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Tỉnh và Phường */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-semibold text-gray-700">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none cursor-pointer"
                                            value={formData.province}
                                            onChange={e => handleChange("province", e.target.value)}
                                            required
                                        >
                                            <option value="">-- Chọn Tỉnh --</option>
                                            {provinces.map((p) => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-semibold text-gray-700">Phường/Xã <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={formData.ward}
                                            onChange={e => handleChange("ward", e.target.value)}
                                            required
                                            disabled={!wards.length}
                                        >
                                            <option value="">-- Chọn Phường/Xã --</option>
                                            {wards.map((w) => (
                                                <option key={w.value} value={w.value}>{w.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Địa chỉ cụ thể */}
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">Địa chỉ cụ thể</label>
                                    <input
                                        type="text"
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                        value={formData.address}
                                        onChange={e => handleChange("address", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Lý do khám */}
                            <div className="space-y-4 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                                    <div className="p-2 bg-indigo-600 rounded-lg">
                                        <FileText className="h-5 w-5 text-white" /> 
                                    </div>
                                    Thông tin khám bệnh
                                </h3>
                                <div>
                                    <label className="block mb-2 font-semibold text-gray-700">Lý do khám</label>
                                    <textarea
                                        rows={4}
                                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                                        value={formData.reason}
                                        onChange={e => handleChange("reason", e.target.value)}
                                        placeholder="Vui lòng mô tả triệu chứng hoặc lý do khám bệnh..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-100"
                            >
                                Xác nhận đặt lịch
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                                <Calendar className="h-6 w-6 text-blue-600" />
                                Thông tin lịch khám
                            </h3>
                            
                            {/* Doctor Info */}
                            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                                <img
                                    src={sidebarInfo.image ? getImageUrl(sidebarInfo.image) : "/placeholder.svg"}
                                    alt={sidebarInfo.doctorName}
                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 shadow-md"
                                    onError={(e) => {
                                        e.target.src = "/placeholder.svg";
                                    }}
                                />
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">{sidebarInfo.doctorName}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{sidebarInfo.specialty}</p>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="space-y-4">
                                <div className="flex gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-gray-900">{sidebarInfo.hospital}</div>
                                        <div className="text-sm text-gray-600">{sidebarInfo.location}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                                    <Calendar className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-gray-500">Ngày khám</div>
                                        <div className="font-semibold text-gray-900">{sidebarInfo.date}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                                    <Clock className="h-5 w-5 text-purple-600 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-gray-500">Giờ khám</div>
                                        <div className="font-semibold text-gray-900">{sidebarInfo.time}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

