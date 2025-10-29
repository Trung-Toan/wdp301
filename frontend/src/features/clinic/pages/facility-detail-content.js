import React, { useState, useEffect } from "react";
import { Star, Phone, Building2, Calendar, ChevronLeft, Loader2, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { clinicApi } from "../../../api/clinic/clinicApi";
import { useAuth } from "../../../hooks/useAuth";

export default function FacilityDetail() {
    const { id: clinicId } = useParams();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const doctorsPerPage = 10;
    const reviewsPerPage = 10;
    const tabsRef = React.useRef(null);

    // State cho clinic detail
    const [clinicData, setClinicData] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [doctorsMeta, setDoctorsMeta] = useState(null);
    const [reviewsMeta, setReviewsMeta] = useState(null);
    
    // Loading states
    const [loading, setLoading] = useState(true);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Review form states
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitingReview, setSubmitingReview] = useState(false);
    const [reviewError, setReviewError] = useState(null);
    const [reviewSuccess, setReviewSuccess] = useState(null);

    // Fetch clinic detail
    useEffect(() => {
        const fetchClinicDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await clinicApi.getClinicDetail(clinicId);
                setClinicData(response.data.data);
            } catch (err) {
                console.error("Error fetching clinic detail:", err);
                setError("Không thể tải thông tin phòng khám. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        if (clinicId) {
            fetchClinicDetail();
        }
    }, [clinicId]);

    // Fetch doctors khi tab doctors được chọn
    useEffect(() => {
        const fetchDoctors = async () => {
            if (activeTab !== "doctors") return;
            
            try {
                setDoctorsLoading(true);
                const response = await clinicApi.getClinicDoctors(clinicId, {
                    specialtyId: selectedSpecialty || undefined,
                    page: currentPage,
                    limit: doctorsPerPage,
                });
                console.log("🩺 Doctors API Response:", response.data.data);
                console.log("🩺 First doctor:", response.data.data[0]);
                setDoctors(response.data.data);
                setDoctorsMeta(response.data.meta);
            } catch (err) {
                console.error("Error fetching doctors:", err);
            } finally {
                setDoctorsLoading(false);
            }
        };

        if (clinicId && activeTab === "doctors") {
            fetchDoctors();
        }
    }, [clinicId, activeTab, currentPage, selectedSpecialty]);

    // Fetch reviews khi tab reviews được chọn
    useEffect(() => {
        const fetchReviews = async () => {
            if (activeTab !== "reviews") return;
            
            try {
                setReviewsLoading(true);
                const response = await clinicApi.getClinicReviews(clinicId, {
                    page: currentPage,
                    limit: reviewsPerPage,
                });
                setReviews(response.data.data);
                setReviewsMeta(response.data.meta);
            } catch (err) {
                console.error("Error fetching reviews:", err);
            } finally {
                setReviewsLoading(false);
            }
        };

        if (clinicId && activeTab === "reviews") {
            fetchReviews();
        }
    }, [clinicId, activeTab, currentPage]);

    // Reset page khi đổi tab hoặc filter
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, selectedSpecialty]);

    // Load doctors when review form is shown
    useEffect(() => {
        const loadDoctorsForReview = async () => {
            if (showReviewForm && doctors.length === 0) {
                try {
                    const response = await clinicApi.getClinicDoctors(clinicId, {
                        page: 1,
                        limit: 100, // Get all doctors for selection
                    });
                    setDoctors(response.data.data);
                } catch (err) {
                    console.error("Error loading doctors for review:", err);
                }
            }
        };

        if (showReviewForm) {
            loadDoctorsForReview();
        }
    }, [showReviewForm, clinicId, doctors.length]);

    // Handle submit review
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setReviewError("Bạn cần đăng nhập để đánh giá");
            return;
        }

        if (!selectedDoctor) {
            setReviewError("Vui lòng chọn bác sĩ để đánh giá");
            return;
        }

        if (!reviewComment.trim()) {
            setReviewError("Vui lòng nhập nội dung đánh giá");
            return;
        }

        try {
            setSubmitingReview(true);
            setReviewError(null);
            setReviewSuccess(null);

            await clinicApi.submitReview({
                doctor_id: selectedDoctor,
                patient_id: user.patient?._id || user._id,
                rating: reviewRating,
                comment: reviewComment,
                is_annonymous: isAnonymous,
            });

            setReviewSuccess("Cảm ơn bạn đã đánh giá!");
            setReviewComment("");
            setReviewRating(5);
            setIsAnonymous(false);
            setSelectedDoctor(null);
            setShowReviewForm(false);

            // Refresh reviews list
            const response = await clinicApi.getClinicReviews(clinicId, {
                page: 1,
                limit: reviewsPerPage,
            });
            setReviews(response.data.data);
            setReviewsMeta(response.data.meta);
            setCurrentPage(1);

        } catch (err) {
            console.error("Error submitting review:", err);
            setReviewError(err.response?.data?.error || "Không thể gửi đánh giá. Vui lòng thử lại sau.");
        } finally {
            setSubmitingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !clinicData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || "Không tìm thấy phòng khám"}</p>
                    <Link to="/home/facility" className="text-blue-600 hover:underline">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-sky-50 to-gray-50 min-h-screen">
            {/* Back Button */}
            <div className="border-b bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <Link 
                        to="/home/facility" 
                        className="inline-flex items-center text-gray-600 hover:text-sky-600 transition-colors group"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Quay lại danh sách</span>
                    </Link>
                </div>
            </div>

            {/* Header Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Banner */}
                        {clinicData.banner_url && (
                            <div className="relative overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src={clinicData.banner_url} 
                                    alt={clinicData.name} 
                                    className="w-full h-48 sm:h-64 lg:h-80 object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            </div>
                        )}

                        {/* Clinic Info Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                                {clinicData.logo_url && (
                                    <div className="flex-shrink-0">
                                        <img 
                                            src={clinicData.logo_url} 
                                            alt={`${clinicData.name} logo`} 
                                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl border-2 border-sky-100 p-2 bg-white" 
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                                        {clinicData.name}
                                    </h1>
                                    
                                    {/* Stats */}
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <span className="font-semibold text-amber-700">{clinicData.rating || 0}</span>
                                            <span className="text-xs text-amber-600">({clinicData.total_reviews || 0})</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-full">
                                            <Building2 className="w-4 h-4 text-sky-600" />
                                            <span className="text-sm font-medium text-sky-700">
                                                {clinicData.doctor_count || 0} bác sĩ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        </div>

                            {clinicData.description && (
                                <p className="text-gray-600 leading-relaxed border-t pt-4 mt-4">
                                    {clinicData.description}
                                </p>
                            )}

                            {clinicData.address && (() => {
                            // Nếu address là object, build địa chỉ từ các parts
                            if (typeof clinicData.address === 'object' && clinicData.address !== null) {
                                const parts = [];
                                if (clinicData.address.houseNumber) parts.push(clinicData.address.houseNumber);
                                if (clinicData.address.alley) parts.push(clinicData.address.alley);
                                if (clinicData.address.street) parts.push(clinicData.address.street);
                                if (clinicData.address.ward) {
                                    parts.push(typeof clinicData.address.ward === 'object' 
                                        ? clinicData.address.ward.name 
                                        : clinicData.address.ward);
                                }
                                if (clinicData.address.district) {
                                    parts.push(typeof clinicData.address.district === 'object' 
                                        ? clinicData.address.district.name 
                                        : clinicData.address.district);
                                }
                                if (clinicData.address.province) {
                                    parts.push(typeof clinicData.address.province === 'object' 
                                        ? clinicData.address.province.name 
                                        : clinicData.address.province);
                                }
                                const addressString = parts.join(", ");
                                
                                return (
                                    <div className="mt-4 flex items-start gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        <Building2 className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{addressString}</span>
                                    </div>
                                );
                            }
                            
                            // Nếu address là string thì hiển thị trực tiếp
                            return (
                                <div className="mt-4 flex items-start gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <Building2 className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{clinicData.address}</span>
                                </div>
                            );
                        })()}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:sticky lg:top-6 h-fit">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-sky-100">
                            <h3 className="font-bold text-lg mb-6 text-gray-900 border-b pb-3">
                                Liên hệ & Đặt lịch
                            </h3>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={() => {
                                        setActiveTab("doctors");
                                        // Scroll to tabs section
                                        setTimeout(() => {
                                            tabsRef.current?.scrollIntoView({ 
                                                behavior: 'smooth', 
                                                block: 'start' 
                                            });
                                        }, 100);
                                    }}
                                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3.5 rounded-xl hover:from-sky-600 hover:to-blue-700 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                    <Calendar className="h-5 w-5" />
                                    Đặt lịch ngay
                            </button>

                                {clinicData.phone && (
                                    <a 
                                        href={`tel:${clinicData.phone}`}
                                        className="w-full border-2 border-sky-200 text-sky-700 py-3.5 rounded-xl hover:bg-sky-50 flex items-center justify-center gap-2 font-medium transition-all"
                                    >
                                        <Phone className="h-5 w-5" />
                                        {clinicData.phone}
                                    </a>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                {clinicData.email && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase min-w-[70px]">Email:</span>
                                        <span className="text-sm text-gray-700 break-all">{clinicData.email}</span>
                                    </div>
                                )}
                                {clinicData.website && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase min-w-[70px]">Website:</span>
                                        <a 
                                            href={clinicData.website.startsWith('http') ? clinicData.website : `https://${clinicData.website}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-sky-600 hover:text-sky-700 hover:underline break-all"
                                        >
                                            {clinicData.website}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {(clinicData.opening_hours || clinicData.closing_hours) && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-sky-600" />
                                        Giờ làm việc
                                    </h4>
                                    <div className="bg-sky-50 rounded-lg p-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700 font-medium">Thứ 2 - Chủ nhật</span>
                                            <span className="text-sky-700 font-semibold">
                                                {clinicData.opening_hours} - {clinicData.closing_hours}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div ref={tabsRef} className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {[
                            { key: "overview", label: "Tổng quan", icon: Building2 },
                            { key: "doctors", label: "Bác sĩ", icon: null },
                            { key: "reviews", label: "Đánh giá", icon: Star }
                        ].map(({ key, label, icon: Icon }) => (
                        <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === key
                                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                {label}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-sky-100">
                            <h3 className="font-bold mb-6 flex items-center gap-2 text-xl text-gray-900">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <Building2 className="h-6 w-6 text-sky-600" />
                                </div>
                                Chuyên khoa
                            </h3>
                            {clinicData.specialties && clinicData.specialties.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {clinicData.specialties.map((sp) => (
                                        <div 
                                            key={sp.id} 
                                            className="group bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-100 px-4 py-4 rounded-xl hover:shadow-md hover:border-sky-300 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3">
                                                {sp.icon_url && (
                                                    <img 
                                                        src={sp.icon_url} 
                                                        alt={sp.name} 
                                                        className="w-10 h-10 flex-shrink-0 group-hover:scale-110 transition-transform"
                                                    />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 group-hover:text-sky-700 transition-colors">
                                                        {sp.name}
                                                    </p>
                                                    {sp.description && (
                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                            {sp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                ))}
                            </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Chưa có thông tin chuyên khoa</p>
                        </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "doctors" && (
                    <div className="space-y-6">
                        {/* Filter by Specialty */}
                        {clinicData.specialties && clinicData.specialties.length > 0 && (
                            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-sky-100">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    🔍 Lọc theo chuyên khoa
                                </label>
                                <select
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50 font-medium"
                                >
                                    <option value="">✨ Tất cả chuyên khoa</option>
                                    {clinicData.specialties.map((sp) => (
                                        <option key={sp.id} value={sp.id}>
                                            {sp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Loading state */}
                        {doctorsLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg">
                                <Loader2 className="h-12 w-12 animate-spin text-sky-600 mb-4" />
                                <p className="text-gray-600">Đang tải danh sách bác sĩ...</p>
                            </div>
                        ) : doctors.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    {doctors.map((doctor) => {
                                        const doctorId = doctor._id || doctor.id;
                                        console.log("👨‍⚕️ Doctor:", doctor.user?.full_name, "ID:", doctorId);
                                        return (
                                        <Link
                                            key={doctorId}
                                            to={`/home/doctordetail/${doctorId}`}
                                            className="group bg-white p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-sky-300 hover:shadow-xl transition-all"
                                        >
                                            <div className="flex gap-4 sm:gap-6">
                                                <div className="flex-shrink-0">
                                                    <img 
                                                        src={doctor.user?.avatar_url || "/default-avatar.png"} 
                                                        alt={doctor.user?.full_name} 
                                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover ring-4 ring-sky-50 group-hover:ring-sky-100 transition-all" 
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-lg sm:text-xl text-gray-900 group-hover:text-sky-700 transition-colors mb-1">
                                                        {doctor.title} {doctor.user?.full_name}
                                                    </h4>
                                                    {doctor.degree && (
                                                        <div className="inline-block bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-1 rounded-md mb-2">
                                                            {doctor.degree}
                                                        </div>
                                                    )}
                                                    {doctor.specialties && doctor.specialties.length > 0 && (
                                                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                                            <Building2 className="h-3.5 w-3.5" />
                                                            {doctor.specialties.map(s => s.name).join(", ")}
                                                        </p>
                                                    )}
                                                    {doctor.experience && (
                                                        <p className="text-sm text-gray-500 mb-2">
                                                            ⏱️ {doctor.experience} năm kinh nghiệm
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
                                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                        <span className="text-sm font-bold text-amber-700">{doctor.rating || 0}</span>
                                                        <span className="text-xs text-amber-600">({doctor.review_count || 0})</span>
                                        </div>
                                    </div>
                                </div>
                                        </Link>
                                        );
                                    })}
                        </div>

                        {/* Pagination */}
                                {doctorsMeta && doctorsMeta.totalPages > 1 && (
                                    <div className="flex flex-wrap justify-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                            className="px-4 py-2.5 border-2 border-sky-200 rounded-xl hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-all"
                            >
                                            ← Trước
                            </button>
                                        {[...Array(doctorsMeta.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                                className={`px-4 py-2.5 rounded-xl font-semibold transition-all ${
                                                    currentPage === i + 1 
                                                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md" 
                                                        : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                            onClick={() => setCurrentPage((p) => Math.min(p + 1, doctorsMeta.totalPages))}
                                            disabled={currentPage === doctorsMeta.totalPages}
                                            className="px-4 py-2.5 border-2 border-sky-200 rounded-xl hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-all"
                                        >
                                            Sau →
                            </button>
                        </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                                <div className="text-6xl mb-4">👨‍⚕️</div>
                                <p className="text-gray-500 text-lg font-medium">Không có bác sĩ nào</p>
                                <p className="text-gray-400 text-sm mt-2">Vui lòng thử lại sau</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="space-y-6">
                        {/* Write Review Button */}
                        {user ? (
                            !showReviewForm ? (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            setShowReviewForm(true);
                                            setReviewError(null);
                                            setReviewSuccess(null);
                                        }}
                                        className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                                    >
                                        <Send className="h-5 w-5" />
                                        ✍️ Viết đánh giá
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-2 border-sky-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">✍️ Viết đánh giá của bạn</h3>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowReviewForm(false);
                                                setReviewError(null);
                                                setReviewSuccess(null);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <span className="text-xl">×</span>
                                        </button>
                                    </div>

                                    {/* Select Doctor */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            👨‍⚕️ Chọn bác sĩ đã khám <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={selectedDoctor || ""}
                                            onChange={(e) => setSelectedDoctor(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50 font-medium"
                                            required
                                        >
                                            <option value="">-- Chọn bác sĩ --</option>
                                            {clinicData?.doctor_count > 0 && doctors.map((doctor) => {
                                                const doctorId = doctor._id || doctor.id;
                                                return (
                                                <option key={doctorId} value={doctorId}>
                                                    {doctor.title} {doctor.user?.full_name}
                                                </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {/* Rating */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            ⭐ Đánh giá <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border-2 border-amber-100">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-125"
                                                >
                                                    <Star
                                                        className={`h-10 w-10 ${
                                                            star <= reviewRating
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="ml-2 text-lg font-bold text-amber-700">
                                                {reviewRating} sao
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            💬 Nhận xét <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ khám, chăm sóc của bác sĩ..."
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                                            rows="5"
                                            required
                                        />
                                    </div>

                                    {/* Anonymous */}
                                    <div className="mb-6">
                                        <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-sky-200 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">🕵️ Đánh giá ẩn danh</span>
                                        </label>
                                    </div>

                                    {/* Error & Success Messages */}
                                    {reviewError && (
                                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                                            <span className="text-lg">⚠️</span>
                                            <span>{reviewError}</span>
                                        </div>
                                    )}
                                    {reviewSuccess && (
                                        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl text-sm flex items-start gap-2">
                                            <span className="text-lg">✅</span>
                                            <span>{reviewSuccess}</span>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                        <button
                                            type="submit"
                                            disabled={submitingReview}
                                            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                                        >
                                            {submitingReview ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    Gửi đánh giá
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowReviewForm(false);
                                                setReviewError(null);
                                                setReviewSuccess(null);
                                            }}
                                            className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-6 text-center">
                                <div className="text-4xl mb-3">🔐</div>
                                <p className="text-sky-900 font-medium mb-2">
                                    Bạn cần đăng nhập để viết đánh giá
                                </p>
                                <Link 
                                    to="/login" 
                                    className="inline-block px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-medium mt-2"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviewsLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg">
                                <Loader2 className="h-12 w-12 animate-spin text-sky-600 mb-4" />
                                <p className="text-gray-600">Đang tải đánh giá...</p>
                            </div>
                        ) : reviews.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {review.patient?.avatar ? (
                                                            <img 
                                                                src={review.patient.avatar} 
                                                                alt={review.patient.name} 
                                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-100"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center text-sky-700 font-bold text-lg">
                                                                {review.patient?.name?.charAt(0) || "?"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">
                                                            {review.patient?.name || "🕵️ Ẩn danh"}
                                                        </h4>
                                                        {review.doctor && (
                                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                                <span>Đánh giá</span>
                                                                <span className="font-medium text-sky-600">{review.doctor.name}</span>
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            📅 {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric"
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full w-fit">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`h-4 w-4 ${
                                                                i < review.rating 
                                                                    ? "text-amber-400 fill-amber-400" 
                                                                    : "text-gray-300"
                                                            }`} 
                                                        />
                            ))}
                        </div>
                    </div>
                                            {review.comment && (
                                                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    "{review.comment}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {reviewsMeta && reviewsMeta.totalPages > 1 && (
                                    <div className="flex flex-wrap justify-center gap-2 mt-8">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2.5 border-2 border-sky-200 rounded-xl hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-all"
                                        >
                                            ← Trước
                                        </button>
                                        {[...Array(reviewsMeta.totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`px-4 py-2.5 rounded-xl font-semibold transition-all ${
                                                    currentPage === i + 1 
                                                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md" 
                                                        : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(p + 1, reviewsMeta.totalPages))}
                                            disabled={currentPage === reviewsMeta.totalPages}
                                            className="px-4 py-2.5 border-2 border-sky-200 rounded-xl hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-all"
                                        >
                                            Sau →
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200">
                                <div className="text-6xl mb-4">💬</div>
                                <p className="text-gray-700 text-lg font-semibold mb-2">Chưa có đánh giá nào</p>
                                <p className="text-gray-500 text-sm">Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
