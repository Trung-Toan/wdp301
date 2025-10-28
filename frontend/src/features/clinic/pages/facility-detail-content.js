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
        <div className="bg-gray-50 min-h-screen">
            {/* Back Button */}
            <div className="border-b bg-white">
                <div className="container mx-auto px-4 py-4">
                    <Link to="/home/facility" className="flex items-center text-gray-700 hover:text-blue-600">
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>

            {/* Header Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Info */}
                    <div className="lg:col-span-2">
                        {clinicData.banner_url && (
                            <img 
                                src={clinicData.banner_url} 
                                alt={clinicData.name} 
                                className="w-full h-64 object-cover rounded-lg mb-6" 
                            />
                        )}
                        <div className="flex items-center gap-3 mb-2">
                            {clinicData.logo_url && (
                                <img 
                                    src={clinicData.logo_url} 
                                    alt={`${clinicData.name} logo`} 
                                    className="w-16 h-16 object-contain rounded-lg" 
                                />
                            )}
                            <h1 className="text-3xl font-bold">{clinicData.name}</h1>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">{clinicData.rating || 0}</span>
                                <span className="text-sm text-gray-500">({clinicData.total_reviews || 0} đánh giá)</span>
                            </div>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{clinicData.doctor_count || 0} bác sĩ</span>
                        </div>

                        {clinicData.description && (
                            <p className="text-gray-600 mt-4 leading-relaxed">{clinicData.description}</p>
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
                                    <div className="mt-4 text-gray-600">
                                        <Building2 className="inline h-4 w-4 mr-2" />
                                        {addressString}
                                    </div>
                                );
                            }
                            
                            // Nếu address là string thì hiển thị trực tiếp
                            return (
                                <div className="mt-4 text-gray-600">
                                    <Building2 className="inline h-4 w-4 mr-2" />
                                    {clinicData.address}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="font-semibold text-lg mb-4">Liên hệ & Đặt lịch</h3>
                            
                            <Link 
                                to={`/home/facilities/${clinicId}/booking`}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-3 flex items-center justify-center"
                            >
                                    <Calendar className="h-5 w-5 mr-2" /> Đặt lịch ngay
                                </Link>
                            
                            {clinicData.phone && (
                                <a 
                                    href={`tel:${clinicData.phone}`}
                                    className="w-full border py-2 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <Phone className="h-5 w-5 mr-2" /> {clinicData.phone}
                                </a>
                            )}

                            <div className="mt-6 border-t pt-4 space-y-2 text-sm">
                                {clinicData.email && (
                                    <div className="text-gray-600">
                                        <span className="font-medium">Email:</span> {clinicData.email}
                                    </div>
                                )}
                                {clinicData.website && (
                                    <div className="text-gray-600">
                                        <span className="font-medium">Website:</span>{" "}
                                        <a 
                                            href={clinicData.website.startsWith('http') ? clinicData.website : `https://${clinicData.website}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {clinicData.website}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {(clinicData.opening_hours || clinicData.closing_hours) && (
                                <div className="mt-6 border-t pt-4">
                                    <h4 className="font-semibold mb-2">Giờ làm việc</h4>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Thứ 2 - Chủ nhật</span>
                                        <span>{clinicData.opening_hours} - {clinicData.closing_hours}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex border-b mb-6">
                    {["overview", "doctors", "reviews"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab === "overview"
                                ? "Tổng quan"
                                : tab === "doctors"
                                    ? "Bác sĩ"
                                        : "Đánh giá"}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                                <Building2 className="h-5 w-5 text-blue-600" /> Chuyên khoa
                            </h3>
                            {clinicData.specialties && clinicData.specialties.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {clinicData.specialties.map((sp) => (
                                        <div 
                                            key={sp.id} 
                                            className="bg-blue-50 border border-blue-100 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            {sp.icon_url && (
                                                <img 
                                                    src={sp.icon_url} 
                                                    alt={sp.name} 
                                                    className="w-8 h-8 mb-2"
                                                />
                                            )}
                                            <p className="font-medium text-gray-800">{sp.name}</p>
                                            {sp.description && (
                                                <p className="text-xs text-gray-500 mt-1">{sp.description}</p>
                                            )}
                                        </div>
                                ))}
                            </div>
                            ) : (
                                <p className="text-gray-500">Chưa có thông tin chuyên khoa</p>
                            )}
                        </div>

                    </div>
                )}

                {activeTab === "doctors" && (
                    <div>
                        {/* Filter by Specialty */}
                        {clinicData.specialties && clinicData.specialties.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lọc theo chuyên khoa:
                                </label>
                                <select
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Tất cả chuyên khoa</option>
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
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : doctors.length > 0 ? (
                            <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {doctors.map((doctor) => (
                                        <Link
                                            key={doctor.id}
                                            to={`/home/doctordetail/${doctor._id}`}
                                            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                                        >
                                    <div className="flex gap-4">
                                                <img 
                                                    src={doctor.user?.avatar_url || "/default-avatar.png"} 
                                                    alt={doctor.user?.full_name} 
                                                    className="w-20 h-20 rounded-lg object-cover" 
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">
                                                        {doctor.title} {doctor.user?.full_name}
                                                    </h4>
                                                    {doctor.degree && (
                                                        <p className="text-sm text-blue-600">{doctor.degree}</p>
                                                    )}
                                                    {doctor.specialties && doctor.specialties.length > 0 && (
                                                        <p className="text-sm text-gray-500">
                                                            {doctor.specialties.map(s => s.name).join(", ")}
                                                        </p>
                                                    )}
                                                    {doctor.experience && (
                                                        <p className="text-sm text-gray-500">{doctor.experience} năm kinh nghiệm</p>
                                                    )}
                                                    <div className="flex items-center gap-1 mt-2">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-medium">{doctor.rating || 0}</span>
                                                        <span className="text-xs text-gray-500">({doctor.review_count || 0} đánh giá)</span>
                                            </div>
                                        </div>
                                    </div>
                                        </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                                {doctorsMeta && doctorsMeta.totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                                        {[...Array(doctorsMeta.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                                className={`px-4 py-2 rounded-lg ${
                                                    currentPage === i + 1 
                                                        ? "bg-blue-600 text-white" 
                                                        : "border hover:bg-gray-100"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                            onClick={() => setCurrentPage((p) => Math.min(p + 1, doctorsMeta.totalPages))}
                                            disabled={currentPage === doctorsMeta.totalPages}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                Không có bác sĩ nào
                    </div>
                )}
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div>
                        {/* Write Review Button */}
                        {user ? (
                            !showReviewForm ? (
                                <div className="mb-6">
                                    <button
                                        onClick={() => {
                                            setShowReviewForm(true);
                                            setReviewError(null);
                                            setReviewSuccess(null);
                                        }}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Send className="h-5 w-5" />
                                        Viết đánh giá
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-lg shadow mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Viết đánh giá của bạn</h3>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowReviewForm(false);
                                                setReviewError(null);
                                                setReviewSuccess(null);
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Select Doctor */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Chọn bác sĩ đã khám <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={selectedDoctor || ""}
                                            onChange={(e) => setSelectedDoctor(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">-- Chọn bác sĩ --</option>
                                            {clinicData?.doctor_count > 0 && doctors.map((doctor) => (
                                                <option key={doctor._id} value={doctor._id}>
                                                    {doctor.title} {doctor.user?.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Rating */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Đánh giá <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`h-8 w-8 ${
                                                            star <= reviewRating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="ml-2 text-gray-600 self-center">
                                                {reviewRating} sao
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nhận xét <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Chia sẻ trải nghiệm của bạn..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="4"
                                            required
                                        />
                                    </div>

                                    {/* Anonymous */}
                                    <div className="mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Đánh giá ẩn danh</span>
                                        </label>
                                    </div>

                                    {/* Error & Success Messages */}
                                    {reviewError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                            {reviewError}
                                        </div>
                                    )}
                                    {reviewSuccess && (
                                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                                            {reviewSuccess}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={submitingReview}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {submitingReview ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
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
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-blue-800 text-sm">
                                    Bạn cần{" "}
                                    <Link to="/login" className="font-medium underline hover:text-blue-900">
                                        đăng nhập
                                    </Link>{" "}
                                    để viết đánh giá
                                </p>
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviewsLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : reviews.length > 0 ? (
                            <>
                                <div className="space-y-4 mb-6">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="bg-white p-6 rounded-lg shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    {review.patient?.avatar && (
                                                        <img 
                                                            src={review.patient.avatar} 
                                                            alt={review.patient.name} 
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <h4 className="font-semibold">{review.patient?.name || "Ẩn danh"}</h4>
                                                        {review.doctor && (
                                                            <p className="text-xs text-gray-500">
                                                                Đánh giá {review.doctor.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`h-4 w-4 ${
                                                                i < review.rating 
                                                                    ? "text-yellow-400 fill-yellow-400" 
                                                                    : "text-gray-300"
                                                            }`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-700 mt-2">{review.comment}</p>
                                            )}
                                            <p className="text-sm text-gray-400 mt-3">
                                                {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {reviewsMeta && reviewsMeta.totalPages > 1 && (
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>
                                        {[...Array(reviewsMeta.totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`px-4 py-2 rounded-lg ${
                                                    currentPage === i + 1 
                                                        ? "bg-blue-600 text-white" 
                                                        : "border hover:bg-gray-100"
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(p + 1, reviewsMeta.totalPages))}
                                            disabled={currentPage === reviewsMeta.totalPages}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                                <p className="text-lg">Chưa có đánh giá nào</p>
                                <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá phòng khám này</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
