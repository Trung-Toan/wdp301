import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    MapPin,
    Clock,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    ArrowLeft,
} from "lucide-react";
import { doctorApi } from "../../../../api";
import { specialtyApi } from "../../../../api";
import "../../../../styles/SpecialtyDetailContent.css";

export default function SpecialtyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [specialtyName, setSpecialtyName] = useState("Chưa xác định");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const specialtyRes = await specialtyApi.getSpecialtyById(id);
                const specialtyData = specialtyRes.data?.data;
                if (specialtyData?.name) {
                    setSpecialtyName("Chuyên khoa " + specialtyData.name);
                }
                const doctorRes = await doctorApi.getDoctorBySpecialty(id, {
                    page: currentPage,
                    limit,
                });

                const data = doctorRes.data;
                setDoctors(data.items || []);
                setTotalPages(data.meta?.totalPages || 1);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentPage]);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const formatAddress = (address) => {
        if (!address) return "Không rõ địa chỉ";
        const { houseNumber, street, ward, province } = address;
        return `${houseNumber ? houseNumber + " " : ""}${street ? street + ", " : ""}${ward?.name ? ward.name + ", " : ""}${province?.name || ""}`;
    };

    return (
        <div className="specialty-detail-modern">
            {/* Header */}
            <div className="specialty-detail-header">
                <button
                    onClick={() => navigate(-1)}
                    className="specialty-detail-back-button"
                >
                    <ArrowLeft size={18} />
                    <span>Quay lại</span>
                </button>

                <h1 className="specialty-detail-title">{specialtyName}</h1>
                <p className="specialty-detail-subtitle">
                    Danh sách bác sĩ thuộc {specialtyName.toLowerCase()}
                </p>
            </div>

            {/* Main Content */}
            <div className="specialty-detail-content">
                {loading ? (
                    <div className="specialty-detail-loading">
                        Đang tải danh sách bác sĩ...
                    </div>
                ) : doctors.length > 0 ? (
                    <>
                        {/* Doctor List */}
                        <div>
                            {doctors.map((doctor) => (
                                <div key={doctor._id} className="doctor-card-detail">
                                    {/* Avatar */}
                                    <div className="doctor-avatar-wrapper">
                                        <img
                                            src={
                                                doctor?.user_id?.avatar_url ||
                                                "/doctor-placeholder.jpg"
                                            }
                                            alt={doctor.title || "Bác sĩ"}
                                            className="doctor-avatar"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="doctor-info-detail">
                                        <h3 className="doctor-name-detail">
                                            {doctor.title || "Bác sĩ"}{" "}
                                            <span className="doctor-name-title">
                                                {doctor?.user_id?.full_name}
                                            </span>
                                        </h3>

                                        <div className="doctor-info-items">
                                            <div className="doctor-info-item-detail">
                                                <GraduationCap className="doctor-info-icon-detail" />
                                                <span className="doctor-info-text-detail">
                                                    {doctor.degree || "Chưa cập nhật chuyên môn"}
                                                </span>
                                            </div>

                                            <div className="doctor-info-item-detail">
                                                <MapPin className="doctor-info-icon-detail" />
                                                <span className="doctor-info-text-detail">
                                                    {doctor.clinic?.name || "Không rõ phòng khám"} –{" "}
                                                    {formatAddress(doctor.clinic?.address)}
                                                </span>
                                            </div>

                                            <div className="doctor-info-item-detail">
                                                <Clock className="doctor-info-icon-detail" />
                                                <span className="doctor-info-text-detail">
                                                    {doctor.experience || "Chưa cập nhật kinh nghiệm"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="doctor-description-detail">
                                            {doctor.description || "Chưa có mô tả chi tiết"}
                                        </p>

                                        {/* Actions */}
                                        <div className="doctor-actions-detail">
                                            <Link
                                                to={`/home/doctordetail/${doctor._id}`}
                                                className="doctor-detail-button"
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="specialty-detail-pagination">
                            <div className="pagination-info">
                                Trang <strong>{currentPage}</strong> / {totalPages}
                            </div>
                            <div className="pagination-controls">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className="pagination-button"
                                >
                                    <ChevronLeft className="pagination-button-icon" />
                                    Trước
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className="pagination-button"
                                >
                                    Sau
                                    <ChevronRight className="pagination-button-icon" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="specialty-detail-empty">
                        <p className="specialty-detail-empty-text">
                            Chưa có bác sĩ trong chuyên khoa này
                        </p>
                        <Link
                            to="/home/doctorlist"
                            className="specialty-detail-empty-button"
                        >
                            Xem tất cả bác sĩ
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
