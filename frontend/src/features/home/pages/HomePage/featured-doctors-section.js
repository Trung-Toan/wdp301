import React, { useEffect, useState } from "react";
import { Star, MapPin, Calendar } from "lucide-react";
import { doctorApi } from "../../../../api";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import "../../../../styles/FeaturedDoctorsSection.css";

export function FeaturedDoctorsSection() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const limit = 4;
                let res;

                if (isAuthenticated) {
                    // Nếu đã đăng nhập -> thử lấy top gần vị trí người dùng
                    try {
                        res = await doctorApi.getDoctorTopNearMe(limit);
                    } catch (err) {
                        // Nếu lỗi (vd: chưa có province) -> fallback về top toàn hệ thống
                        console.warn("Cannot get doctors near me, falling back to top doctors:", err.message);
                        res = await doctorApi.getDoctorTop(limit);
                    }
                } else {
                    // Nếu chưa đăng nhập -> top toàn hệ thống
                    res = await doctorApi.getDoctorTop(limit);
                }

                setDoctors(res.data.data || []);
            } catch (err) {
                console.error("Lỗi khi lấy bác sĩ top:", err);
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [isAuthenticated]); // useEffect sẽ chạy lại khi login/logout

    return (
        <section id="doctors" className="featured-doctors-section-modern">
            <div className="featured-doctors-container">
                <div className="featured-doctors-header">
                    <h2 className="featured-doctors-title">
                        Bác sĩ nổi bật
                    </h2>
                    <p className="featured-doctors-subtitle">
                        Đội ngũ bác sĩ giàu kinh nghiệm và tận tâm
                    </p>
                </div>

                {loading ? (
                    <div className="featured-doctors-loading">
                        Đang tải bác sĩ...
                    </div>
                ) : doctors.length > 0 ? (
                    <>
                        <div className="featured-doctors-grid">
                            {doctors.map((doctor) => (
                                <Link
                                    key={doctor._id}
                                    to={`/home/doctordetail/${doctor._id}`}
                                    className="doctor-card"
                                >
                                    {/* Doctor Image */}
                                    <div className="doctor-image-wrapper">
                                        <img
                                            src={doctor.avatar_url || "/placeholder.svg"}
                                            alt={doctor.full_name || "Bác sĩ"}
                                            className="doctor-image"
                                        />
                                        <div className="doctor-image-overlay"></div>
                                    </div>

                                    {/* Doctor Content */}
                                    <div className="doctor-content">
                                        {/* Name */}
                                        <div>
                                            <h3 className="doctor-name">
                                                <span className="doctor-name-link">
                                                    {(doctor.title || "") + " - " + (doctor.full_name || "Chưa có tên bác sĩ")}
                                                </span>
                                            </h3>

                                            {/* Specialty Badge */}
                                            {doctor.specialties?.length > 0 ? (
                                                <div className="doctor-specialty-badge">
                                                    {doctor.specialties.map((s) => s.name).join(", ")}
                                                </div>
                                            ) : (
                                                <div className="doctor-specialty-badge-empty">
                                                    Chưa có chuyên khoa
                                                </div>
                                            )}
                                        </div>

                                        {/* Rating */}
                                        <div className="doctor-rating">
                                            <Star className="doctor-rating-icon" />
                                            <span>{doctor.rating || "-"}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="doctor-info">
                                            <div className="doctor-info-item">
                                                <MapPin className="doctor-info-icon" />
                                                <span className="doctor-info-text">
                                                    {doctor.clinic?.name || "Chưa có phòng khám"}
                                                </span>
                                            </div>
                                            <div className="doctor-info-item">
                                                <Calendar className="doctor-info-icon" />
                                                <span className="doctor-info-text">
                                                    {doctor.degree || "Chưa có bằng cấp"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* View All Button */}
                        <div className="featured-doctors-view-all">
                            <Link to="/home/doctorlist" className="featured-doctors-view-all-button">
                                Xem tất cả bác sĩ
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="featured-doctors-empty">
                        Không có bác sĩ nào
                    </div>
                )}
            </div>
        </section>
    );
}
