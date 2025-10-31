import {
    Star,
    Award,
    GraduationCap,
    Stethoscope,
    ChevronLeft,
    MapPin,
    Hospital,
    Send
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { DoctorBookingCalendar } from "../../components/DoctorBookingCalendar";
import { doctorApi } from "../../../../api";
import { useAuth } from "../../../../hooks/useAuth";
import { axiosInstance } from "../../../../api/axiosInstance";
import "../../../../styles/DoctorDetailContent.css";

export function DoctorDetailContent({ doctorId }) {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("about");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchDoctor = async () => {
            setLoading(true);
            try {
                const res = await doctorApi.getDoctorById(doctorId);
                console.log("Doctor in Doctor Details:", res.data);
                setDoctor(res.data || {});
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Lỗi khi tải bác sĩ");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!user) {
            setSubmitError("Vui lòng đăng nhập để đánh giá");
            return;
        }
        if (rating === 0) {
            setSubmitError("Vui lòng chọn số sao đánh giá");
            return;
        }
        if (!comment.trim()) {
            setSubmitError("Vui lòng nhập nhận xét");
            return;
        }

        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            // Giả định endpoint là /patient/feedback hoặc /feedback
            const response = await axiosInstance.post("/patient/feedback", {
                doctorId: doctorId,
                rating: rating,
                comment: comment.trim()
            });

            if (response.data?.success) {
                setSubmitSuccess(true);
                setRating(0);
                setComment("");
                // Reload doctor data to show new feedback
                const res = await doctorApi.getDoctorById(doctorId);
                setDoctor(res.data || {});
                setTimeout(() => setSubmitSuccess(false), 3000);
            }
        } catch (err) {
            setSubmitError(err.response?.data?.message || err.message || "Có lỗi xảy ra khi gửi đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="doctor-loading">Đang tải...</div>;
    if (error) return <div className="doctor-error">{error}</div>;
    if (!doctor || Object.keys(doctor).length === 0) return <div className="doctor-not-found">Bác sĩ không tồn tại</div>;

    const d = doctor.data;

    // Build address string
    const buildAddress = () => {
        if (!d.clinic?.address) return "Chưa rõ địa chỉ";
        const addr = d.clinic.address;
        const parts = [
            addr.houseNumber,
            addr.street,
            typeof addr.ward === "object" ? addr.ward.name : addr.ward,
            typeof addr.district === "object" ? addr.district.name : addr.district,
            typeof addr.province === "object" ? addr.province.name : addr.province
        ].filter(Boolean);
        return parts.join(", ");
    };

    return (
        <div className="doctor-detail-modern">
            <div className="doctor-detail-container">
                {/* Back button */}
                <Link to="/home/doctorlist" className="doctor-detail-back-button">
                    <ChevronLeft className="doctor-detail-back-icon" />
                    Quay lại danh sách
                </Link>

                <div className="doctor-detail-layout">
                    {/* Main Info */}
                    <div>
                        {/* Doctor Info Card */}
                        <div className="doctor-info-card">
                            <div className="doctor-info-content">
                                <div className="doctor-avatar-wrapper">
                                    <img
                                        src={d.avatar_url || "/placeholder.svg"}
                                        alt={d.name || "Doctor"}
                                        className="doctor-avatar"
                                    />
                                </div>
                                <div className="doctor-info-wrapper">
                                    <h1 className="doctor-name-title">
                                        {d.title} - <span className="doctor-name-title-name">{d.name || "Không có tên"}</span>
                                    </h1>

                                    <div className="doctor-specialty-badge">
                                        <Stethoscope className="doctor-specialty-badge-icon" />
                                        <span>{d.specialties?.[0]?.name || "Chưa có chuyên khoa"}</span>
                                    </div>

                                    <div className="doctor-details-list">
                                        <div className="doctor-detail-item">
                                            <Hospital className="doctor-detail-icon" />
                                            <span className="doctor-detail-text">{d.clinic?.name || "Chưa có bệnh viện"}</span>
                                        </div>

                                        {d.clinic?.address && (
                                            <div className="doctor-detail-item">
                                                <MapPin className="doctor-detail-icon" />
                                                <span className="doctor-detail-text">{buildAddress()}</span>
                                            </div>
                                        )}

                                        <div className="doctor-detail-item">
                                            <GraduationCap className="doctor-detail-icon" />
                                            <span className="doctor-detail-text">{d.degree || "Chưa có học vị"}</span>
                                        </div>

                                        <div className="doctor-rating">
                                            <Star className="doctor-rating-icon" />
                                            <span>{d.rating?.average?.toFixed(1) || 0}</span>
                                            <span className="doctor-rating-text">
                                                ({d.rating?.total || 0} đánh giá)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="doctor-detail-tabs">
                            <div className="doctor-tabs-list">
                                <button
                                    className={`doctor-tabs-trigger ${activeTab === "about" ? "active" : ""}`}
                                    onClick={() => setActiveTab("about")}
                                >
                                    Giới thiệu
                                </button>
                                <button
                                    className={`doctor-tabs-trigger ${activeTab === "licenses" ? "active" : ""}`}
                                    onClick={() => setActiveTab("licenses")}
                                >
                                    Chứng chỉ
                                </button>
                                <button
                                    className={`doctor-tabs-trigger ${activeTab === "reviews" ? "active" : ""}`}
                                    onClick={() => setActiveTab("reviews")}
                                >
                                    Đánh giá
                                </button>
                            </div>

                            {/* About */}
                            {activeTab === "about" && (
                                <div className="doctor-tabs-content">
                                    <div className="doctor-content-card">
                                        <div className="doctor-card-header">
                                            <h3 className="doctor-card-title">
                                                <Stethoscope className="doctor-card-title-icon" />
                                                Về bác sĩ
                                            </h3>
                                        </div>
                                        <div className="doctor-card-content">
                                            {d.description || "Chưa có thông tin về bác sĩ."}
                                        </div>
                                    </div>

                                    <div className="doctor-content-card">
                                        <div className="doctor-card-header">
                                            <h3 className="doctor-card-title">
                                                <GraduationCap className="doctor-card-title-icon" />
                                                Kinh nghiệm
                                            </h3>
                                        </div>
                                        <div className="doctor-card-content">
                                            {d.experience || "Chưa cập nhật kinh nghiệm"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Licenses */}
                            {activeTab === "licenses" && (
                                <div className="doctor-tabs-content">
                                    <div className="doctor-content-card">
                                        <div className="doctor-card-header">
                                            <h3 className="doctor-card-title">
                                                <Award className="doctor-card-title-icon" />
                                                Chứng chỉ hành nghề
                                            </h3>
                                        </div>
                                        <div className="doctor-card-content">
                                            {d.licenses?.length > 0 ? (
                                                <div className="doctor-licenses-list">
                                                    {d.licenses.map((l) => (
                                                        <div key={l.id} className="doctor-license-item">
                                                            <div className="doctor-license-field">
                                                                <strong>Số chứng chỉ:</strong> {l.licenseNumber}
                                                            </div>
                                                            <div className="doctor-license-field">
                                                                <strong>Cấp bởi:</strong> {l.issued_by}
                                                            </div>
                                                            <div className="doctor-license-field">
                                                                <strong>Hiệu lực:</strong> {new Date(l.issued_date).toLocaleDateString()} - {new Date(l.expiry_date).toLocaleDateString()}
                                                            </div>
                                                            <div className="doctor-license-field">
                                                                <strong>Trạng thái:</strong> {l.status}
                                                            </div>
                                                            {l.document_url?.length > 0 && (
                                                                <a
                                                                    href={l.document_url[0]}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="doctor-license-link"
                                                                >
                                                                    Xem tài liệu
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="doctor-empty-text">Chưa có chứng chỉ.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            {activeTab === "reviews" && (
                                <div className="doctor-tabs-content">
                                    {/* Feedback Form */}
                                    {user ? (
                                        <div className="doctor-content-card">
                                            <div className="doctor-card-header">
                                                <h3 className="doctor-card-title">Viết đánh giá</h3>
                                            </div>
                                            <div className="doctor-card-content">
                                                <form onSubmit={handleSubmitFeedback} className="doctor-feedback-form">
                                                    <div className="doctor-feedback-rating-section">
                                                        <label className="doctor-feedback-label">Đánh giá của bạn:</label>
                                                        <div className="doctor-feedback-stars-input">
                                                            {[...Array(5)].map((_, i) => {
                                                                const starValue = i + 1;
                                                                return (
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        className={`doctor-feedback-star-button ${starValue <= (hoverRating || rating) ? "active" : ""}`}
                                                                        onClick={() => setRating(starValue)}
                                                                        onMouseEnter={() => setHoverRating(starValue)}
                                                                        onMouseLeave={() => setHoverRating(0)}
                                                                    >
                                                                        <Star className="doctor-feedback-star-icon" />
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="doctor-feedback-comment-section">
                                                        <label htmlFor="comment" className="doctor-feedback-label">Nhận xét:</label>
                                                        <textarea
                                                            id="comment"
                                                            className="doctor-feedback-textarea"
                                                            placeholder="Chia sẻ trải nghiệm của bạn về bác sĩ..."
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                            rows={5}
                                                            required
                                                        />
                                                    </div>

                                                    {submitError && (
                                                        <div className="doctor-feedback-error">{submitError}</div>
                                                    )}

                                                    {submitSuccess && (
                                                        <div className="doctor-feedback-success">Cảm ơn bạn đã đánh giá!</div>
                                                    )}

                                                    <button
                                                        type="submit"
                                                        className="doctor-feedback-submit-button"
                                                        disabled={submitting || rating === 0 || !comment.trim()}
                                                    >
                                                        {submitting ? (
                                                            <>Đang gửi...</>
                                                        ) : (
                                                            <>
                                                                <Send className="doctor-feedback-submit-icon" />
                                                                Gửi đánh giá
                                                            </>
                                                        )}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="doctor-content-card">
                                            <div className="doctor-card-content">
                                                <p className="doctor-feedback-login-message">
                                                    Vui lòng <Link to="/login" className="doctor-feedback-login-link">đăng nhập</Link> để viết đánh giá.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    <div className="doctor-content-card">
                                        <div className="doctor-card-header">
                                            <h3 className="doctor-card-title">Đánh giá từ bệnh nhân</h3>
                                        </div>
                                        <div className="doctor-card-content">
                                            {d.feedbacks?.length > 0 ? (
                                                <div className="doctor-reviews-list">
                                                    {d.feedbacks.map((fb) => (
                                                        <div key={fb.id} className="doctor-review-item">
                                                            <div className="doctor-review-header">
                                                                <img
                                                                    src={fb.patient?.avatar_url || "/default-avatar.png"}
                                                                    alt={fb.patient?.full_name}
                                                                    className="doctor-review-avatar"
                                                                />
                                                                <span className="doctor-review-name">{fb.patient?.full_name || "Người dùng"}</span>
                                                            </div>

                                                            <div className="doctor-review-stars">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`doctor-review-star ${i < fb.rating ? "filled" : "empty"}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <p className="doctor-review-comment">{fb.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="doctor-empty-text">Chưa có đánh giá nào.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Booking */}
                    <DoctorBookingCalendar
                        doctor={d}
                        onSlotSelect={(slot) => {
                            const slotToSend = {
                                ...slot,
                                clinicId: slot.clinic?._id,
                                specialtyId: slot.specialty?._id,
                            };
                            navigate("/booking", { state: { selectedSlot: slotToSend, doctorId: d.id } });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
