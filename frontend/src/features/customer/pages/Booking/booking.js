import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, User, FileText, ChevronLeft } from "lucide-react";
import BookingSuccess from "./bookingSuccess";
import { patientsApi } from "../../../../api/patients/patientsApi";
import { provinceApi } from "../../../../api/address/provinceApi";
import { wardApi } from "../../../../api/address/wardApi";
const FILE_SERVER_URL = "http://localhost:5000/uploads";

export function BookingContent() {
    const location = useLocation();
    const { selectedDate, selectedSlot, doctorName, specialty, hospital, price, doctorId, doctorAvatar } = location.state || {};

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
        if (storedUser || storedAccount) {
            // Chuyển định dạng ngày nếu có
            let dobFormatted = "";
            if (storedUser?.dob) {
                const date = new Date(storedUser.dob);
                // Format thành yyyy-MM-dd
                dobFormatted = date.toISOString().split("T")[0];
            }

            setFormData(prev => ({
                ...prev,
                fullName: storedUser.full_name || "",
                phone: storedAccount.phone_number || "",
                email: storedAccount.email || "",
                dateOfBirth: dobFormatted,
                gender: storedUser.gender || "Nam",
                address: storedUser.address || "",
            }));
        }
    }, [storedUser, storedAccount]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    // Xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSlot) return alert("Vui lòng chọn lịch khám");
        if (!formData.dateOfBirth) return alert("Vui lòng nhập ngày sinh");
        if (!formData.province) return alert("Vui lòng chọn Tỉnh/Thành phố");
        if (!formData.ward) return alert("Vui lòng chọn Phường/Xã");

        // Kiểm tra nếu không có patientId thì báo lỗi
        if (!patientId) {
            alert("Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.");
            return;
        }

        try {
            const genderMap = {
                "Nam": "MALE",
                "Nữ": "FEMALE",
                "Khác": "OTHER"
            };
            const apiGender = genderMap[formData.gender] || formData.gender.toUpperCase();

            const payload = {
                slot_id: selectedSlot.id,
                doctor_id: doctorId,
                patient_id: patientId,
                specialty_id: selectedSlot.specialtyId?.id || selectedSlot.specialtyId,
                clinic_id: selectedSlot.clinicId,
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

            console.log("📤 Đang gửi đặt lịch với patient_id:", patientId);
            const response = await patientsApi.createAppointment(payload);
            console.log("✅ Đặt lịch thành công!");
            setBookingInfo(response.data);
            setIsSubmitted(true);
        } catch (err) {
            console.error("❌ Lỗi khi đặt lịch:", err);
            if (err.response) {
                console.error("🔍 Chi tiết lỗi từ API:", err.response.data);
                alert(`Lỗi: ${JSON.stringify(err.response.data, null, 2)}`);
            } else {
                alert(err.message || "Đặt lịch thất bại");
            }
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
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <Link to={`/home/doctordetail/${doctorId}`}>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
                        <ChevronLeft className="h-4 w-4" /> Quay lại
                    </button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                        <h2 className="text-2xl font-bold mb-2">Thông tin đặt lịch khám</h2>
                        <p className="text-gray-500 mb-6">Vui lòng điền đầy đủ thông tin để hoàn tất đặt lịch</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Thông tin cá nhân */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" /> Thông tin bệnh nhân
                                </h3>

                                {/* Họ tên và SĐT */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">Họ và tên <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg p-2"
                                            value={formData.fullName}
                                            onChange={e => handleChange("fullName", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Số điện thoại <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            className="w-full border rounded-lg p-2"
                                            value={formData.phone}
                                            onChange={e => handleChange("phone", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email và Ngày sinh */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">Email</label>
                                        <input
                                            type="email"
                                            className="w-full border rounded-lg p-2"
                                            value={formData.email}
                                            onChange={e => handleChange("email", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Ngày sinh <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            className="w-full border rounded-lg p-2"
                                            value={formData.dateOfBirth}
                                            onChange={e => handleChange("dateOfBirth", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Giới tính */}
                                <div>
                                    <label className="block mb-2 font-medium">Giới tính <span className="text-red-500">*</span></label>
                                    <div className="flex gap-6">
                                        {["Nam", "Nữ", "Khác"].map(g => (
                                            <label key={g} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    value={g}
                                                    checked={formData.gender === g}
                                                    onChange={e => handleChange("gender", e.target.value)}
                                                />
                                                {g === "Nam" ? "Nam" : g === "Nữ" ? "Nữ" : "Khác"}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Tỉnh và Phường */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 font-medium">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border rounded-lg p-2"
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
                                        <label className="block mb-1 font-medium">Phường/Xã <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border rounded-lg p-2"
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
                                    <label className="block mb-1 font-medium">Địa chỉ cụ thể</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        value={formData.address}
                                        onChange={e => handleChange("address", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Lý do khám */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> Thông tin khám bệnh
                                </h3>
                                <div>
                                    <label className="block mb-1 font-medium">Lý do khám</label>
                                    <textarea
                                        rows={4}
                                        className="w-full border rounded-lg p-2"
                                        value={formData.reason}
                                        onChange={e => handleChange("reason", e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Xác nhận đặt lịch
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow p-6 sticky top-24">
                            <h3 className="font-semibold mb-4">Thông tin lịch khám</h3>
                            <div className="flex gap-4">
                                <img
                                    src={sidebarInfo.image ? sidebarInfo.image.startsWith("http")
                                        ? sidebarInfo.image
                                        : `${FILE_SERVER_URL}/${sidebarInfo.image}`
                                        : "/placeholder.svg"}
                                    alt={sidebarInfo.doctorName}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold">{sidebarInfo.doctorName}</h4>
                                    <p className="text-sm text-gray-500">{sidebarInfo.specialty}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex gap-3 text-sm">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <div>{sidebarInfo.hospital}</div>
                                        <div className="text-gray-500">{sidebarInfo.location}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    {sidebarInfo.date}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    {sidebarInfo.time}
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Phí khám:</span>
                                    <span className="font-semibold">{sidebarInfo.price}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-500">Phí dịch vụ:</span>
                                    <span className="font-semibold">Miễn phí</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t">
                                    <span className="font-semibold">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-blue-600">{sidebarInfo.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
