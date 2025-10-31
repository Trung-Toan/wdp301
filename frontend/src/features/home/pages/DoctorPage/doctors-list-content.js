import { useEffect, useState } from "react";
import { Search, MapPin, Star, Hospital, Award, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { doctorApi } from "../../../../api";
import "../../../../styles/DoctorsListContent.css";

export default function DoctorsListContent() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả");
    const [selectedProvince, setSelectedProvince] = useState("Tất cả");
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [provinces, setProvinces] = useState([]);

    // Lấy danh sách bác sĩ
    useEffect(() => {
        async function fetchDoctors() {
            try {
                const res = await doctorApi.getDoctorTop({ limit: 0 });

                const apiDoctors = res.data?.data || [];

                const mapped = apiDoctors
                    .filter(
                        (d) =>
                            d.specialties?.[0]?.name &&
                            d.clinic?.address?.province
                    )
                    .map((d) => {
                        const addr = d.clinic?.address;
                        let provinceName = "";
                        let location = "Chưa rõ địa chỉ";

                        if (addr) {
                            provinceName =
                                typeof addr.province === "object"
                                    ? addr.province.name
                                    : addr.province;
                            const districtName =
                                typeof addr.district === "object"
                                    ? addr.district.name
                                    : addr.district;
                            const wardName =
                                typeof addr.ward === "object"
                                    ? addr.ward.name
                                    : addr.ward;

                            location = [
                                addr.houseNumber,
                                addr.street,
                                wardName,
                                districtName,
                                provinceName,
                            ]
                                .filter(Boolean)
                                .join(", ");
                        }

                        return {
                            id: d._id,
                            title: d.title || "Chưa cập nhật",
                            fullname: d.full_name || "Không có tên",
                            specialty: d.specialties?.[0]?.name || "",
                            hospital: d.clinic?.name || "Không có phòng khám",
                            location,
                            provinceName,
                            rating: d.rating || 0,
                            totalFeedback: d.totalFeedbacks || 0,
                            experience: d.experience || "Đang cập nhật",
                            image: d.avatar_url || "/placeholder.svg",
                        };
                    });

                const uniqueSpecialties = [
                    "Tất cả",
                    ...Array.from(
                        new Set(mapped.map((d) => d.specialty).filter(Boolean))
                    ),
                ];

                const uniqueProvinces = [
                    "Tất cả",
                    ...Array.from(
                        new Set(mapped.map((d) => d.provinceName).filter(Boolean))
                    ),
                ];

                setDoctors(mapped);
                setSpecialties(uniqueSpecialties);
                setProvinces(uniqueProvinces);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách bác sĩ:", err);
            }
        }
        fetchDoctors();
    }, []);

    // Lọc bác sĩ
    const filteredDoctors = doctors.filter((doctor) => {
        const matchesSearch =
            doctor.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpecialty =
            selectedSpecialty === "Tất cả" ||
            doctor.specialty === selectedSpecialty;

        const matchesProvince =
            selectedProvince === "Tất cả" ||
            doctor.provinceName === selectedProvince;

        return matchesSearch && matchesSpecialty && matchesProvince;
    });

    return (
        <div className="doctors-list-modern">
            {/* Search Header */}
            <div className="doctors-list-header">
                <div className="doctors-list-header-container">
                    <h1 className="doctors-list-title">
                        Tìm kiếm bác sĩ
                    </h1>
                    <div className="doctors-list-search-wrapper">
                        <Search className="doctors-list-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên bác sĩ, chuyên khoa, bệnh viện..."
                            className="doctors-list-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="doctors-list-content-section">
                <div className="doctors-list-container">
                    <div className="doctors-list-layout">
                        {/* Sidebar Filter */}
                        <aside className="doctors-list-sidebar">
                            <div className="doctors-list-filter-card">
                                {/* Chuyên khoa */}
                                <div className="doctors-list-filter-section">
                                    <h3 className="doctors-list-filter-title">
                                        Chuyên khoa
                                    </h3>
                                    <div className="doctors-list-filter-buttons">
                                        {specialties.map((specialty) => (
                                            <button
                                                key={specialty}
                                                onClick={() => {
                                                    console.log("🩺 Chọn chuyên khoa:", specialty);
                                                    setSelectedSpecialty(specialty);
                                                }}
                                                className={`doctors-list-filter-button ${selectedSpecialty === specialty ? 'active' : ''}`}
                                            >
                                                {specialty}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tỉnh */}
                                <div className="doctors-list-filter-divider"></div>
                                <div className="doctors-list-filter-section">
                                    <h3 className="doctors-list-filter-title">
                                        Tỉnh/Thành phố
                                    </h3>
                                    <div className="doctors-list-filter-buttons">
                                        {provinces.map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => {
                                                    console.log("📍 Chọn tỉnh:", p);
                                                    setSelectedProvince(p);
                                                }}
                                                className={`doctors-list-filter-button ${selectedProvince === p ? 'active' : ''}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="doctors-list-main">
                            <div className="doctors-list-count">
                                Tìm thấy <strong>{filteredDoctors.length}</strong> bác sĩ
                            </div>

                            <div className="doctors-list-cards">
                                {filteredDoctors.length > 0 ? (
                                    filteredDoctors.map((doctor, index) => (
                                        <div key={doctor.id} className="doctor-card-list-item">
                                            <div className="doctor-card-list-content">
                                                {/* Avatar */}
                                                <div className="doctor-card-avatar-wrapper">
                                                    <Link to={`/home/doctordetail/${doctor.id}`}>
                                                        <img
                                                            src={doctor.image}
                                                            alt={doctor.fullname}
                                                            className="doctor-card-avatar"
                                                        />
                                                    </Link>
                                                </div>

                                                {/* Info */}
                                                <div className="doctor-card-info">
                                                    <h3 className="doctor-card-name">
                                                        <Link
                                                            to={`/home/doctordetail/${doctor.id}`}
                                                            className="doctor-card-name-link"
                                                        >
                                                            {doctor.title} -{" "}
                                                            <span className="doctor-card-name-title">
                                                                {doctor.fullname}
                                                            </span>
                                                        </Link>
                                                    </h3>

                                                    {/* Badges */}
                                                    <div className="doctor-card-badges">
                                                        <div className="doctor-card-specialty-badge">
                                                            <Stethoscope className="doctor-card-specialty-badge-icon" />
                                                            <span>
                                                                {doctor.specialty || "Chưa có chuyên khoa"}
                                                            </span>
                                                        </div>
                                                        <div className="doctor-card-available-badge">
                                                            Còn lịch
                                                        </div>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="doctor-card-details">
                                                        <div className="doctor-card-detail-item">
                                                            <Hospital className="doctor-card-detail-icon" />
                                                            <span className="doctor-card-detail-text">
                                                                {doctor.hospital}
                                                            </span>
                                                        </div>
                                                        <div className="doctor-card-detail-item">
                                                            <MapPin className="doctor-card-detail-icon" />
                                                            <span className="doctor-card-detail-text">
                                                                {doctor.location}
                                                            </span>
                                                        </div>
                                                        <div className="doctor-card-detail-item">
                                                            <Award className="doctor-card-detail-icon" />
                                                            <span className="doctor-card-detail-text">
                                                                {doctor.experience}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="doctor-card-rating">
                                                        <Star className="doctor-card-rating-icon" />
                                                        <span>{doctor.rating}</span>
                                                        <span className="doctor-card-rating-text">
                                                            ({doctor.totalFeedback} đánh giá)
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <div className="doctor-card-action">
                                                    <Link
                                                        to={`/home/doctordetail/${doctor.id}`}
                                                        className="doctor-card-button"
                                                    >
                                                        Đặt lịch khám
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="doctors-list-empty">
                                        <p className="doctors-list-empty-text">
                                            Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
