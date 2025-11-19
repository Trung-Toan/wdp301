import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, User, FileText, ChevronLeft, AlertCircle, CheckCircle, Heart, UserCircle, Info, X } from "lucide-react";
import { toast } from "react-toastify";
import BookingSuccess from "./bookingSuccess";
import { patientsApi } from "../../../../api/patients/patientsApi";
import { provinceApi } from "../../../../api/address/provinceApi";
import { wardApi } from "../../../../api/address/wardApi";
import { clinicApi } from "../../../../api/clinic/clinicApi";
import { doctorApi } from "../../../../api/doctor/doctorApi";
import { SLOT_API } from "../../../../api/assistant/assistant.api";
import { profilePatientApi } from "../../../../api/patients/profilePatientApi";
import { relativesApi } from "../../../../api/patients/relativesApi";
import FirstTimeGuide from "../../../../components/FirstTimeGuide";
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

// Helper function để tính tuổi từ ngày sinh
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    try {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Nếu chưa tới sinh nhật năm nay
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (isNaN(age) || age < 0) return null;
        return age;
    } catch (err) {
        return null;
    }
};

// Ngưỡng tuổi để xác định người già (>= 60 tuổi)
const ELDERLY_AGE_THRESHOLD = 60;

export function BookingContent() {
    const location = useLocation();
    const { selectedDate, selectedSlot, doctorName, specialty, hospital, price, doctorId, doctorAvatar, clinicId, doctor } = location.state || {};


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
        // Thông tin người thân (cho người già)
        relativeName: "",
        relativePhone: "",
        relativeRelationship: "",
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
    const [doctorData, setDoctorData] = useState(null);
    
    // States cho người già
    const [isElderly, setIsElderly] = useState(false);
    const [patientAge, setPatientAge] = useState(null);
    const [showElderlyWarningModal, setShowElderlyWarningModal] = useState(false);

    // States cho booking cho người thân
    const [bookingFor, setBookingFor] = useState("self"); // "self" hoặc "relative"
    const [relativesList, setRelativesList] = useState([]);
    const [selectedRelativeId, setSelectedRelativeId] = useState(null);
    const [isLoadingRelatives, setIsLoadingRelatives] = useState(false);
    const [saveRelative, setSaveRelative] = useState(false); // Checkbox để lưu người thân

    const [storedAccount, setStoredAccount] = useState(() => JSON.parse(sessionStorage.getItem("account") || "{}"));
    const [storedUser, setStoredUser] = useState(() => JSON.parse(sessionStorage.getItem("user") || "{}"));
    const [storedPatient, setStoredPatient] = useState(() => JSON.parse(sessionStorage.getItem("patient") || "null"));

    // Fetch lại dữ liệu user/patient mới nhất từ API để đảm bảo có dữ liệu cập nhật
    useEffect(() => {
        const fetchLatestUserData = async () => {
            try {
                const res = await profilePatientApi.getInformation();
                const userData = res.data?.data || res.data || {};
                
                // Cập nhật state với dữ liệu mới nhất
                if (userData) {
                    // Cập nhật user data (bao gồm gender, full_name, dob, address)
                    setStoredUser(userData);
                    sessionStorage.setItem("user", JSON.stringify(userData));
                    
                    // Cập nhật account data (bao gồm phone_number, email)
                    // Kiểm tra cả userData.account và giữ nguyên account cũ nếu không có
                    const currentAccount = JSON.parse(sessionStorage.getItem("account") || "{}");
                    
                    // Merge account mới với account cũ để đảm bảo không mất dữ liệu (đặc biệt là phone_number)
                    const mergedAccount = {
                        ...currentAccount, // Giữ nguyên dữ liệu cũ trước
                        ...(userData.account || {}), // Merge dữ liệu mới từ API
                        // Đảm bảo phone_number luôn được giữ lại nếu có trong currentAccount
                        phone_number: userData.account?.phone_number || currentAccount?.phone_number || undefined
                    };
                    
                    // Chỉ set nếu có ít nhất một field trong account
                    if (userData.account || Object.keys(currentAccount).length > 0) {
                        setStoredAccount(mergedAccount);
                        sessionStorage.setItem("account", JSON.stringify(mergedAccount));
                    }
                    
                    // Cập nhật patient data nếu có
                    if (userData.patient) {
                        setStoredPatient(userData.patient);
                        sessionStorage.setItem("patient", JSON.stringify(userData.patient));
                    }
                }
            } catch (err) {
                // Nếu không fetch được, vẫn dùng dữ liệu từ sessionStorage
            }
        };
        
        fetchLatestUserData();
    }, []); // Chỉ chạy một lần khi component mount

    // Fetch patient_id từ API nếu không có trong sessionStorage
    useEffect(() => {
        const fetchPatientId = async () => {
            // Nếu có storedPatient, dùng luôn
            if (storedPatient && typeof storedPatient === 'object' && Object.keys(storedPatient).length > 0) {
                const id = storedPatient._id || storedPatient.id;
                if (id) {
                    setPatientId(id);
                    return;
                }
            }

            // Nếu không có storedPatient nhưng có storedUser, dùng user._id làm fallback
            if (storedUser && typeof storedUser === 'object' && Object.keys(storedUser).length > 0) {
                const fallbackId = storedUser._id || storedUser.id;
                if (fallbackId) {
                    setPatientId(fallbackId);
                    return;
                }
            }
        };
        fetchPatientId();
    }, [storedAccount, storedUser, storedPatient]);



    // Load danh sách tỉnh
    useEffect(() => {
        async function fetchProvinces() {
            try {
                const res = await provinceApi.getProvinces();
                const data = res.data?.options || [];
                setProvinces(data);
            } catch (err) {
                // Error loading provinces
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
                // Error loading wards
            }
        }
        fetchWards();
    }, [formData.province]);

    // Tính tuổi và xác định người già
    useEffect(() => {
        if (formData.dateOfBirth) {
            const age = calculateAge(formData.dateOfBirth);
            setPatientAge(age);
            setIsElderly(age !== null && age >= ELDERLY_AGE_THRESHOLD);
        } else {
            setPatientAge(null);
            setIsElderly(false);
        }
    }, [formData.dateOfBirth]);

    // Load relatives khi bookingFor === "relative" HOẶC khi người già đặt lịch (để có thể chọn người thân đã lưu)
    useEffect(() => {
        const fetchRelatives = async () => {
            if (bookingFor === "relative" || (isElderly && bookingFor === "self")) {
                setIsLoadingRelatives(true);
                try {
                    const response = await relativesApi.getRelatives({ page: 1, limit: 50 });
                    // Response format: { ok: true, data: [...], pagination: {...} }
                    const relatives = response.data?.data || [];
                    setRelativesList(relatives);
                } catch (err) {
                    // Không hiển thị error nếu chỉ là để load cho người già (optional)
                    if (bookingFor === "relative") {
                        toast.error("Không thể tải danh sách người thân", {
                            position: "top-center",
                            autoClose: 5000,
                        });
                    }
                } finally {
                    setIsLoadingRelatives(false);
                }
            }
        };
        fetchRelatives();
    }, [bookingFor, isElderly]);

    // Auto-fill form khi chọn relative hoặc clear form khi chuyển sang relative mà chưa chọn
    useEffect(() => {
        if (bookingFor === "relative") {
            if (selectedRelativeId) {
                // Nếu đã chọn relative, auto-fill form
                const selectedRelative = relativesList.find(r => r._id === selectedRelativeId);
                if (selectedRelative) {
                    // Format dob
                    let dobFormatted = "";
                    if (selectedRelative.dob) {
                        const date = new Date(selectedRelative.dob);
                        dobFormatted = date.toISOString().split("T")[0];
                    }

                    // Convert gender
                    const convertGender = (gender) => {
                        if (!gender) return "male";
                        const genderLower = gender.toLowerCase();
                        if (genderLower === "male" || genderLower === "nam") return "male";
                        if (genderLower === "female" || genderLower === "nữ") return "female";
                        if (genderLower === "other" || genderLower === "khác") return "other";
                        return "male";
                    };

                    setFormData(prev => ({
                        ...prev,
                        fullName: selectedRelative.full_name || "",
                        phone: selectedRelative.phone || "",
                        email: selectedRelative.email || "",
                        dateOfBirth: dobFormatted,
                        gender: convertGender(selectedRelative.gender),
                        province: selectedRelative.province_code || "",
                        ward: selectedRelative.ward_code || "",
                        address: selectedRelative.address || "",
                        relativeRelationship: selectedRelative.relationship || "",
                    }));
                }
            } else {
                // Nếu chưa chọn relative, clear form (chỉ giữ lại reason)
                setFormData(prev => ({
                    fullName: "",
                    phone: "",
                    email: "",
                    dateOfBirth: "",
                    gender: "male",
                    province: "",
                    ward: "",
                    address: "",
                    reason: prev.reason || "", // Giữ lại reason
                    relativeName: prev.relativeName || "",
                    relativePhone: prev.relativePhone || "",
                    relativeRelationship: "",
                }));
            }
        } else if (bookingFor === "self") {
            // Reset selectedRelativeId khi chuyển về "self"
            // Form sẽ được điền lại bởi useEffect khác khi bookingFor === "self"
            setSelectedRelativeId(null);
        }
    }, [selectedRelativeId, relativesList, bookingFor]);

    // Gán dữ liệu user vào form
    useEffect(() => {
        if ((storedUser || storedAccount || storedPatient) && bookingFor === "self") {
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

            // Lấy phone_number từ nhiều nguồn
            const phoneNumber = 
                storedAccount?.phone_number || 
                storedUser?.account?.phone_number ||
                storedUser?.phone_number ||
                storedPatient?.phone_number ||
                "";

            // Lấy email từ nhiều nguồn
            const email = 
                storedAccount?.email || 
                storedUser?.account?.email ||
                storedUser?.email ||
                storedPatient?.email ||
                "";

            // Lấy gender từ nhiều nguồn
            const genderValue = convertGender(
                storedUser?.gender || 
                storedPatient?.gender ||
                ""
            );

            const newFormData = {
                fullName: storedUser?.full_name || "",
                phone: phoneNumber || "",
                email: email || "",
                dateOfBirth: dobFormatted || "",
                gender: genderValue || "male",
                province: provinceCode || "",
                ward: wardCode || "",
                address: addressText || "",
                reason: "", // Giữ nguyên reason nếu có
            };

            // Update form data - điền đầy đủ thông tin user khi bookingFor === "self"
            setFormData(prev => {
                return {
                    ...prev,
                    // Điền tất cả các field từ user data (kể cả empty string)
                    fullName: newFormData.fullName || "",
                    phone: phoneNumber || "",
                    email: email || "",
                    dateOfBirth: dobFormatted || "",
                    gender: genderValue || "male",
                    province: provinceCode || "",
                    ward: wardCode || "",
                    address: addressText || "",
                    // Giữ nguyên reason và các field khác
                    reason: prev.reason || "",
                    // Clear relativeRelationship khi chuyển về self
                    relativeRelationship: "",
                };
            });
        }
    }, [storedUser, storedAccount, storedPatient, bookingFor]);

    // Fetch clinic data nếu có clinicId
    useEffect(() => {
        const fetchClinicData = async () => {
            // Lấy clinicId từ nhiều nguồn (ưu tiên theo thứ tự)
            const finalClinicId = 
                clinicId || // từ location.state
                selectedSlot?.clinicId || // từ selectedSlot
                selectedSlot?.clinic?._id || // từ selectedSlot.clinic
                selectedSlot?.clinic_id || // từ selectedSlot
                doctor?.clinic?._id || // từ doctor object
                doctor?.clinic_id || // từ doctor object
                null;

            if (finalClinicId) {
                try {
                    const response = await clinicApi.getClinicDetail(finalClinicId);
                    const clinicInfo = response.data?.data || response.data || null;
                    setClinicData(clinicInfo);
                } catch (err) {
                    // Error fetching clinic data
                }
            }
        };
        fetchClinicData();
    }, [clinicId, selectedSlot, doctor]);

    // Fetch doctor data nếu có doctorId để lấy clinic address (fallback nếu không có clinicData)
    useEffect(() => {
        const fetchDoctorData = async () => {
            // Fetch nếu không có clinicData và có doctorId
            if (!clinicData && doctorId) {
                try {
                    const response = await doctorApi.getDoctorById(doctorId);
                    const doctorInfo = response.data?.data || response.data;
                    
                    if (doctorInfo) {
                        setDoctorData(doctorInfo);
                        
                        // Nếu có clinic trong doctor data, cũng set vào clinicData
                        if (doctorInfo.clinic_id || doctorInfo.clinic) {
                            const clinicInfo = doctorInfo.clinic_id || doctorInfo.clinic;
                            
                            // Nếu clinicInfo là object có đầy đủ thông tin, set luôn
                            if (clinicInfo && typeof clinicInfo === 'object' && clinicInfo._id) {
                                setClinicData(clinicInfo);
                            } 
                            // Nếu clinicInfo là ID, fetch clinic detail
                            else if (clinicInfo && typeof clinicInfo === 'string') {
                                try {
                                    const clinicResponse = await clinicApi.getClinicDetail(clinicInfo);
                                    const clinicDetail = clinicResponse.data?.data || clinicResponse.data || null;
                                    if (clinicDetail) {
                                        setClinicData(clinicDetail);
                                    }
                                } catch (clinicErr) {
                                    // Error fetching clinic detail
                                }
                            }
                        }
                    }
                } catch (err) {
                    // Error fetching doctor data
                }
            }
        };
        fetchDoctorData();
    }, [doctorId, clinicData, doctor]);

    // Fetch slot detail để lấy clinic info (nếu selectedSlot chỉ có id)
    useEffect(() => {
        const fetchSlotDetail = async () => {
            // Chỉ fetch nếu không có clinicData và selectedSlot có id nhưng không có clinic
            if (!clinicData && selectedSlot?.id && !selectedSlot?.clinic && !selectedSlot?.clinicId) {
                try {
                    const response = await SLOT_API.getDetailsSlot(selectedSlot.id);
                    const slotInfo = response.data?.data || response.data || null;
                    
                    if (slotInfo) {
                        // Nếu slot có clinic info, fetch clinic detail
                        const slotClinicId = slotInfo.clinic_id || slotInfo.clinic?._id || slotInfo.clinic?.id;
                        if (slotClinicId) {
                            try {
                                const clinicResponse = await clinicApi.getClinicDetail(slotClinicId);
                                const clinicDetail = clinicResponse.data?.data || clinicResponse.data || null;
                                if (clinicDetail) {
                                    setClinicData(clinicDetail);
                                }
                            } catch (clinicErr) {
                                // Error fetching clinic detail from slot
                            }
                        }
                    }
                } catch (err) {
                    // Error fetching slot detail
                }
            }
        };
        fetchSlotDetail();
    }, [selectedSlot, clinicData]);

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

        if (!provinces || provinces.length === 0) {
            setLocationWarning(null);
            return;
        }

        const patientProvinceName = getProvinceName(formData.province);
        let clinicProvinceName = null;
        let clinicProvinceCode = null;

        // 1. Từ clinicData (đã fetch từ clinicId)
        if (clinicData) {
            // Cấu trúc 1: address.province.name
            if (clinicData.address?.province?.name) {
                clinicProvinceName = clinicData.address.province.name;
                clinicProvinceCode = clinicData.address.province.code;
            }
            // Cấu trúc 2: address.province (string)
            else if (typeof clinicData.address?.province === 'string') {
                clinicProvinceName = clinicData.address.province;
            }
            // Cấu trúc 3: address.province_code
            else if (clinicData.address?.province_code) {
                clinicProvinceCode = clinicData.address.province_code;
                clinicProvinceName = getProvinceName(clinicProvinceCode);
            }
            // Cấu trúc 4: province trực tiếp (string)
            else if (typeof clinicData.province === 'string') {
                clinicProvinceName = clinicData.province;
            }
            // Cấu trúc 5: province_code trực tiếp
            else if (clinicData.province_code) {
                clinicProvinceCode = clinicData.province_code;
                clinicProvinceName = getProvinceName(clinicProvinceCode);
            }
        }
        
        // 2. Từ doctor object trong state (nếu có)
        if (!clinicProvinceName && doctor?.clinic?.address?.province?.name) {
            clinicProvinceName = doctor.clinic.address.province.name;
            clinicProvinceCode = doctor.clinic.address.province.code;
        } else if (!clinicProvinceName && typeof doctor?.clinic?.address?.province === 'string') {
            clinicProvinceName = doctor.clinic.address.province;
        } else if (!clinicProvinceCode && doctor?.clinic?.address?.province_code) {
            clinicProvinceCode = doctor.clinic.address.province_code;
            clinicProvinceName = getProvinceName(clinicProvinceCode);
        }
        
        // 2b. Từ doctorData (đã fetch từ API)
        // Kiểm tra clinic_id (có thể là object hoặc ID)
        if (!clinicProvinceName && doctorData?.clinic_id) {
            const clinicInfo = doctorData.clinic_id;
            // Nếu clinic_id là object
            if (typeof clinicInfo === 'object') {
                // Cấu trúc 1: address.province.name
                if (clinicInfo.address?.province?.name) {
                    clinicProvinceName = clinicInfo.address.province.name;
                    clinicProvinceCode = clinicInfo.address.province.code;
                }
                // Cấu trúc 2: address.province (string)
                else if (typeof clinicInfo.address?.province === 'string') {
                    clinicProvinceName = clinicInfo.address.province;
                }
                // Cấu trúc 3: address.province_code
                else if (clinicInfo.address?.province_code) {
                    clinicProvinceCode = clinicInfo.address.province_code;
                    clinicProvinceName = getProvinceName(clinicProvinceCode);
                }
                // Cấu trúc 4: province trực tiếp (string) - từ log console
                else if (typeof clinicInfo.province === 'string') {
                    clinicProvinceName = clinicInfo.province;
                }
                // Cấu trúc 5: province_code trực tiếp
                else if (clinicInfo.province_code) {
                    clinicProvinceCode = clinicInfo.province_code;
                    clinicProvinceName = getProvinceName(clinicProvinceCode);
                }
            }
        }
        
        // Kiểm tra clinic (có thể là object)
        if (!clinicProvinceName && doctorData?.clinic) {
            const clinicInfo = doctorData.clinic;
            // Cấu trúc 1: address.province.name
            if (clinicInfo.address?.province?.name) {
                clinicProvinceName = clinicInfo.address.province.name;
                clinicProvinceCode = clinicInfo.address.province.code;
            }
            // Cấu trúc 2: address.province (string)
            else if (typeof clinicInfo.address?.province === 'string') {
                clinicProvinceName = clinicInfo.address.province;
            }
            // Cấu trúc 3: address.province_code
            else if (clinicInfo.address?.province_code) {
                clinicProvinceCode = clinicInfo.address.province_code;
                clinicProvinceName = getProvinceName(clinicProvinceCode);
            }
            // Cấu trúc 4: province trực tiếp (string) - từ log console
            else if (typeof clinicInfo.province === 'string') {
                clinicProvinceName = clinicInfo.province;
            }
            // Cấu trúc 5: province_code trực tiếp
            else if (clinicInfo.province_code) {
                clinicProvinceCode = clinicInfo.province_code;
                clinicProvinceName = getProvinceName(clinicProvinceCode);
            }
        }
        
        // 3. Từ selectedSlot (nếu có clinic object)
        if (!clinicProvinceName && selectedSlot?.clinic?.address?.province?.name) {
            clinicProvinceName = selectedSlot.clinic.address.province.name;
            clinicProvinceCode = selectedSlot.clinic.address.province.code;
        } else if (!clinicProvinceName && typeof selectedSlot?.clinic?.address?.province === 'string') {
            clinicProvinceName = selectedSlot.clinic.address.province;
        } else if (!clinicProvinceCode && selectedSlot?.clinic?.address?.province_code) {
            clinicProvinceCode = selectedSlot.clinic.address.province_code;
            clinicProvinceName = getProvinceName(clinicProvinceCode);
        }
        
        // 3b. Từ selectedSlot.clinicId (nếu có clinicId nhưng chưa có clinic object)
        // Nếu đã có clinicData từ fetch, không cần check thêm
        // (clinicData đã được check ở phần 1)

        // Nếu có province code, so sánh trực tiếp (chính xác hơn)
        if (clinicProvinceCode && formData.province) {
            if (clinicProvinceCode === formData.province) {
                setLocationWarning(null);
                return;
            }
        }

        // Chỉ hiển thị cảnh báo nếu có đủ thông tin cả hai bên
        if (!patientProvinceName || !clinicProvinceName) {
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

        const normalizedClinic = normalizeProvince(clinicProvinceName);
        const normalizedPatient = normalizeProvince(patientProvinceName);

        // Nếu khác nhau, hiển thị cảnh báo
        if (normalizedClinic !== normalizedPatient) {
            const isCrossCity = (normalizedClinic === 'HCM' && normalizedPatient === 'Hanoi') || 
                               (normalizedClinic === 'Hanoi' && normalizedPatient === 'HCM');
            setLocationWarning({
                clinic: clinicProvinceName,
                patient: patientProvinceName,
                isCrossCity
            });
        } else {
            setLocationWarning(null);
        }
    }, [formData.province, clinicData, provinces, doctor, selectedSlot, doctorData]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    // Xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSlot) {
            toast.error("Vui lòng chọn lịch khám", {
                position: "top-center",
                autoClose: 5000,
            });
            return;
        }
        if (!formData.dateOfBirth) {
            toast.error("Vui lòng nhập ngày sinh", {
                position: "top-center",
                autoClose: 5000,
            });
            return;
        }
        if (!formData.province) {
            toast.error("Vui lòng chọn Tỉnh/Thành phố", {
                position: "top-center",
                autoClose: 5000,
            });
            return;
        }
        if (!formData.ward) {
            toast.error("Vui lòng chọn Phường/Xã", {
                position: "top-center",
                autoClose: 5000,
            });
            return;
        }

        // Kiểm tra nếu không có patientId thì báo lỗi
        if (!patientId) {
            toast.error("Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.", {
                position: "top-center",
                autoClose: 6000,
            });
            return;
        }

        // Kiểm tra mối quan hệ khi booking cho người thân
        if (bookingFor === "relative" && !formData.relativeRelationship) {
            toast.error("Vui lòng chọn mối quan hệ", {
                position: "top-center",
                autoClose: 5000,
            });
            return;
        }

        // Kiểm tra thông tin người thân cho người già (BẮT BUỘC)
        // Người già phải có ít nhất: tên người thân HOẶC số điện thoại người thân
        if (isElderly && bookingFor === "self" && !formData.relativeName && !formData.relativePhone) {
            toast.error("Vui lòng điền thông tin người thân (ít nhất tên hoặc số điện thoại) để chúng tôi có thể liên hệ khi cần thiết.", {
                position: "top-center",
                autoClose: 10000,
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

    // Handler để tiếp tục đặt lịch sau khi xác nhận từ elderly warning modal
    const handleContinueBookingAfterElderlyWarning = async () => {
        setShowElderlyWarningModal(false);
        // Kiểm tra cảnh báo chéo thành phố và yêu cầu xác nhận
        if (locationWarning?.isCrossCity && !pendingSubmit) {
            setShowConfirmModal(true);
            return;
        }
        // Tiếp tục submit
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

            // Nếu booking cho người thân và có chọn lưu, tạo relative trước
            let createdRelativeId = selectedRelativeId;
            if (bookingFor === "relative" && saveRelative && !selectedRelativeId) {
                try {
                    const relativeData = {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        email: formData.email || null,
                        dob: formData.dateOfBirth || null,
                        gender: apiGender,
                        province_code: formData.province || null,
                        ward_code: formData.ward || null,
                        address: formData.address || null,
                        relationship: formData.relativeRelationship,
                    };
                    const relativeResponse = await relativesApi.createRelative(relativeData);
                    createdRelativeId = relativeResponse.data?.data?._id || relativeResponse.data?._id;
                    toast.success("Đã lưu thông tin người thân", {
                        position: "top-center",
                        autoClose: 4000,
                    });
                } catch (err) {
                    // Nếu lưu thất bại, vẫn tiếp tục đặt lịch nhưng không lưu relative
                    toast.warning("Không thể lưu thông tin người thân, nhưng vẫn tiếp tục đặt lịch", {
                        position: "top-center",
                        autoClose: 5000,
                    });
                }
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
                // Booking for relative
                booking_for: bookingFor,
                ...(bookingFor === "relative" && createdRelativeId && {
                    relative_id: createdRelativeId,
                }),
                // Thông tin người thân (cho người già)
                ...(isElderly && {
                    relative_name: formData.relativeName || null,
                    relative_phone: formData.relativePhone || null,
                    relative_relationship: formData.relativeRelationship || null,
                    is_elderly: true,
                    patient_age: patientAge,
                }),
            };

            setShowConfirmModal(false);
            const response = await patientsApi.createAppointment(payload);
            
            // Hiển thị toast success
            toast.success("Đặt lịch khám thành công!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            setBookingInfo(response.data);
            setIsSubmitted(true);
            setPendingSubmit(false);
        } catch (err) {
            setPendingSubmit(false);
            
            let errorMessage = "Đặt lịch thất bại. Vui lòng thử lại!";
            
            if (err.response) {
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
                autoClose: 7000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }

    };

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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all mb-8 group font-semibold">
                        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> 
                        <span>Quay lại</span>
                    </button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                    <Calendar className="text-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Đặt lịch khám bệnh</h2>
                                    <p className="text-gray-600 text-lg font-medium">Vui lòng điền đầy đủ thông tin để hoàn tất đặt lịch</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className={`space-y-8 ${isElderly ? 'elderly-mode' : ''}`} style={isElderly ? {
                            fontSize: '1.1rem',
                        } : {}}>
                            {/* Booking For Selector */}
                            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                                <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                                    <UserCircle className="h-5 w-5 text-indigo-600" />
                                    Đặt lịch cho
                                </h3>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer flex-1 p-4 rounded-xl border-2 transition-all hover:bg-white/50"
                                        style={{
                                            borderColor: bookingFor === "self" ? "#4f46e5" : "#e5e7eb",
                                            backgroundColor: bookingFor === "self" ? "white" : "transparent"
                                        }}>
                                        <input
                                            type="radio"
                                            name="bookingFor"
                                            value="self"
                                            checked={bookingFor === "self"}
                                            onChange={(e) => setBookingFor(e.target.value)}
                                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-900">Bản thân</div>
                                            <div className="text-sm text-gray-600">Đặt lịch cho chính bạn</div>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer flex-1 p-4 rounded-xl border-2 transition-all hover:bg-white/50"
                                        style={{
                                            borderColor: bookingFor === "relative" ? "#4f46e5" : "#e5e7eb",
                                            backgroundColor: bookingFor === "relative" ? "white" : "transparent"
                                        }}>
                                        <input
                                            type="radio"
                                            name="bookingFor"
                                            value="relative"
                                            checked={bookingFor === "relative"}
                                            onChange={(e) => setBookingFor(e.target.value)}
                                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <div className="font-semibold text-gray-900">Người thân</div>
                                            <div className="text-sm text-gray-600">Đặt lịch cho người thân</div>
                                        </div>
                                    </label>
                                </div>

                                {/* Relative Selection (chỉ hiện khi bookingFor === "relative") */}
                                {bookingFor === "relative" && (
                                    <div className="mt-4 space-y-3">
                                        {isLoadingRelatives ? (
                                            <div className="text-center py-4 text-gray-600">Đang tải danh sách người thân...</div>
                                        ) : relativesList.length > 0 ? (
                                            <>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Chọn người thân đã lưu (tùy chọn)
                                                </label>
                                                <select
                                                    value={selectedRelativeId || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSelectedRelativeId(value || null);
                                                        // Nếu chọn "-- Chọn người thân hoặc nhập mới --", clear form
                                                        if (!value) {
                                                            setFormData(prev => ({
                                                                fullName: "",
                                                                phone: "",
                                                                email: "",
                                                                dateOfBirth: "",
                                                                gender: "male",
                                                                province: "",
                                                                ward: "",
                                                                address: "",
                                                                reason: prev.reason || "",
                                                                relativeName: prev.relativeName || "",
                                                                relativePhone: prev.relativePhone || "",
                                                                relativeRelationship: "",
                                                            }));
                                                        }
                                                    }}
                                                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                                >
                                                    <option value="">-- Chọn người thân hoặc nhập mới --</option>
                                                    {relativesList.map((relative) => (
                                                        <option key={relative._id} value={relative._id}>
                                                            {relative.full_name} - {relative.phone} ({relative.relationship === "cha" ? "Cha" : relative.relationship === "me" ? "Mẹ" : relative.relationship === "con" ? "Con" : relative.relationship === "vo_chong" ? "Vợ/Chồng" : relative.relationship === "anh_chi_em" ? "Anh/Chị/Em" : relative.relationship === "ban" ? "Bạn" : "Khác"})
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedRelativeId && (
                                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                                                        ✓ Đã chọn người thân. Thông tin đã được điền tự động. Bạn có thể chỉnh sửa nếu cần.
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-sm text-gray-600 py-2">
                                                Bạn chưa có người thân nào đã lưu. Vui lòng điền thông tin bên dưới.
                                            </div>
                                        )}
                                        
                                        {/* Checkbox để lưu người thân mới */}
                                        {!selectedRelativeId && (
                                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <input
                                                    type="checkbox"
                                                    checked={saveRelative}
                                                    onChange={(e) => setSaveRelative(e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Lưu thông tin người thân này để sử dụng lần sau
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Elderly User Notice */}
                            {isElderly && (
                                <div className="flex items-start gap-3 p-5 rounded-2xl shadow-sm border-2 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300">
                                    <div className="flex-shrink-0 p-2 rounded-xl bg-pink-100">
                                        <Heart className="h-6 w-6 text-pink-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold mb-2 text-lg text-pink-900">
                                            💝 Hỗ trợ đặc biệt cho người cao tuổi
                                        </p>
                                        <p className="text-sm leading-relaxed text-pink-800">
                                            Chúng tôi hiểu rằng bạn là người cao tuổi ({patientAge} tuổi). 
                                            Để đảm bảo bạn được chăm sóc tốt nhất, chúng tôi khuyến nghị bạn điền thông tin người thân bên dưới. 
                                            Điều này giúp chúng tôi liên hệ với người thân nếu cần thiết.
                                        </p>
                                    </div>
                                </div>
                            )}

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
                                        <label className={`block mb-2 font-semibold text-gray-700 ${isElderly ? 'text-lg' : ''}`}>
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none ${isElderly ? 'p-4 text-lg' : 'p-3'}`}
                                            value={formData.fullName}
                                            onChange={e => handleChange("fullName", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block mb-2 font-semibold text-gray-700 ${isElderly ? 'text-lg' : ''}`}>
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            className={`w-full border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none ${isElderly ? 'p-4 text-lg' : 'p-3'}`}
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
                                        <label className={`block mb-2 font-semibold text-gray-700 ${isElderly ? 'text-lg' : ''}`}>
                                            Ngày sinh <span className="text-red-500">*</span>
                                            {patientAge !== null && (
                                                <span className="ml-2 text-blue-600 font-normal">
                                                    ({patientAge} tuổi)
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="date"
                                            className={`w-full border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none ${isElderly ? 'p-4 text-lg' : 'p-3'}`}
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

                                {/* Mối quan hệ (chỉ hiện khi booking cho người thân) */}
                                {bookingFor === "relative" && (
                                    <div>
                                        <label className={`block mb-2 font-semibold text-gray-700 ${isElderly ? 'text-lg' : ''}`}>
                                            Mối quan hệ <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className={`w-full border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none ${isElderly ? 'p-4 text-lg' : 'p-3'}`}
                                            value={formData.relativeRelationship}
                                            onChange={e => handleChange("relativeRelationship", e.target.value)}
                                            required
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
                                )}

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

                            {/* Thông tin người thân (cho người già) */}
                            {isElderly && bookingFor === "self" && (
                                <div className="space-y-4 p-6 bg-pink-50/50 rounded-xl border-2 border-pink-200">
                                    <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                                        <div className="p-2 bg-pink-600 rounded-lg">
                                            <Heart className="h-5 w-5 text-white" /> 
                                        </div>
                                        Thông tin người thân <span className="text-red-500 text-lg">*</span>
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        <strong className="text-red-600">Bắt buộc:</strong> Vui lòng điền thông tin người thân (ít nhất tên hoặc số điện thoại) để chúng tôi có thể liên hệ trong trường hợp cần thiết.
                                    </p>
                                    
                                    {/* Cho phép chọn từ danh sách người thân đã lưu (nếu có) */}
                                    {relativesList.length > 0 && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Hoặc chọn từ danh sách người thân đã lưu
                                            </label>
                                            <select
                                                value={relativesList.find(r => 
                                                    r.full_name === formData.relativeName && 
                                                    r.phone === formData.relativePhone
                                                )?._id || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value) {
                                                        const selectedRelative = relativesList.find(r => r._id === value);
                                                        if (selectedRelative) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                relativeName: selectedRelative.full_name || "",
                                                                relativePhone: selectedRelative.phone || "",
                                                                relativeRelationship: selectedRelative.relationship || "",
                                                            }));
                                                        }
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            relativeName: "",
                                                            relativePhone: "",
                                                            relativeRelationship: "",
                                                        }));
                                                    }
                                                }}
                                                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                            >
                                                <option value="">-- Chọn người thân đã lưu (tùy chọn) --</option>
                                                {relativesList.map((relative) => (
                                                    <option key={relative._id} value={relative._id}>
                                                        {relative.full_name} - {relative.phone} ({relative.relationship === "cha" ? "Cha" : relative.relationship === "me" ? "Mẹ" : relative.relationship === "con" ? "Con" : relative.relationship === "vo_chong" ? "Vợ/Chồng" : relative.relationship === "anh_chi_em" ? "Anh/Chị/Em" : relative.relationship === "ban" ? "Bạn" : "Khác"})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <label className="block mb-1 font-semibold text-gray-700">
                                                    Họ tên người thân <span className="text-red-500">*</span>
                                                </label>
                                                <span className="text-xs text-gray-500 font-normal mb-2">(ít nhất một trong hai)</span>
                                                <input
                                                    type="text"
                                                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                                    value={formData.relativeName}
                                                    onChange={e => handleChange("relativeName", e.target.value)}
                                                    placeholder="Nhập họ tên người thân"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block mb-1 font-semibold text-gray-700">
                                                    Số điện thoại người thân <span className="text-red-500">*</span>
                                                </label>
                                                <span className="text-xs text-gray-500 font-normal mb-2">(ít nhất một trong hai)</span>
                                                <input
                                                    type="tel"
                                                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                                                    value={formData.relativePhone}
                                                    onChange={e => handleChange("relativePhone", e.target.value)}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <label className="block mb-2 font-semibold text-gray-700">
                                                Mối quan hệ
                                            </label>
                                            <select
                                                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none cursor-pointer appearance-none bg-white"
                                                value={formData.relativeRelationship}
                                                onChange={e => handleChange("relativeRelationship", e.target.value)}
                                            >
                                                <option value="">-- Chọn mối quan hệ --</option>
                                                <option value="con">Con</option>
                                                <option value="chau">Cháu</option>
                                                <option value="vo_chong">Vợ/Chồng</option>
                                                <option value="anh_chi_em">Anh/Chị/Em</option>
                                                <option value="ban">Bạn</option>
                                                <option value="khac">Khác</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-100 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="h-6 w-6" />
                                Xác nhận đặt lịch
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
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
            
            {/* Elderly Warning Modal */}
            {showElderlyWarningModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowElderlyWarningModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 text-white p-5 sm:p-6 rounded-t-3xl">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                    <div className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg flex-shrink-0">
                                        <UserCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-1">Thông báo quan trọng</h2>
                                        <p className="text-white/90 text-xs sm:text-sm">Dành cho người cao tuổi</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowElderlyWarningModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 flex-shrink-0"
                                    aria-label="Đóng"
                                >
                                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 sm:p-6 space-y-4">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="p-2.5 sm:p-3 bg-pink-100 rounded-xl flex-shrink-0">
                                    <Info className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                        Bạn là người cao tuổi. Chúng tôi <strong className="text-pink-600">khuyến nghị</strong> bạn nên điền thông tin người thân để được hỗ trợ tốt hơn trong trường hợp khẩn cấp.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                                        Thông tin người thân sẽ giúp chúng tôi liên hệ khi cần thiết và đảm bảo an toàn cho bạn.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 sm:p-6 pt-0 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowElderlyWarningModal(false)}
                                className="flex-1 px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base"
                            >
                                Quay lại điền thông tin
                            </button>
                            <button
                                onClick={handleContinueBookingAfterElderlyWarning}
                                className="flex-1 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
                            >
                                Tiếp tục đặt lịch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FirstTimeGuide page="booking" />
        </div>
        </>
    );
}

