import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import LocationSelector from "../../components/LocationSelector";
import { specialtyApi } from "../../../../api";
import { useNavigate } from "react-router-dom";
import "../../../../styles/HeroSection.css";

export function HeroSection() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        specialtyId: "",
        provinceCode: "",
        wardCode: "",
        q: "",
    });

    const [specialties, setSpecialties] = useState([]); // Danh sách chuyên khoa

    // Lấy danh sách chuyên khoa khi component load
    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await specialtyApi.getAll();

                const list =
                    Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res.data?.data)
                            ? res.data.data
                            : Array.isArray(res.data?.specialties)
                                ? res.data.specialties
                                : [];

                setSpecialties(list);
                console.log("Specialties loaded:", list);
                if (list.length > 0) {
                    console.log("First specialty:", list[0]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
                setSpecialties([]); // đảm bảo không gây lỗi .map
            }
        };
        fetchSpecialties();
    }, []);


    const handleLocationChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            provinceCode: value.province,
            wardCode: value.ward,
        }));
    };

    const handleSearch = () => {
        // Navigate to clinic search page with filters as query params
        const params = new URLSearchParams();
        if (filters.specialtyId) params.append("specialtyId", filters.specialtyId);
        if (filters.provinceCode) params.append("provinceCode", filters.provinceCode);
        if (filters.wardCode) params.append("wardCode", filters.wardCode);
        if (filters.q) params.append("q", filters.q);

        navigate(`/clinics/search?${params.toString()}`);
    };

    return (
        <section className="hero-section-modern">
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Đặt lịch khám bệnh{" "}
                        <span className="hero-title-gradient-1">dễ dàng</span> và{" "}
                        <span className="hero-title-gradient-2">nhanh chóng</span>
                    </h1>

                    <p className="hero-description">
                        Kết nối với hàng nghìn bác sĩ chuyên khoa và cơ sở y tế uy tín trên toàn quốc.
                        Đặt lịch chỉ trong vài phút.
                    </p>

                    {/* Bộ lọc tìm kiếm */}
                    <div className="hero-search-box">
                        <div className="hero-search-grid">
                            {/* Chọn chuyên khoa */}
                            <div className="hero-select-wrapper">
                                <select
                                    value={filters.specialtyId}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        console.log("Selected specialty value:", value, typeof value);
                                        const selectedSpecialty = specialties.find(s => (s.id || s._id) === value || (s.id || s._id) === value.toString());
                                        if (selectedSpecialty && selectedSpecialty.name) {
                                            console.log("Specialty name:", selectedSpecialty.name);
                                        }
                                        setFilters((prev) => ({ ...prev, specialtyId: value }));
                                    }}
                                    className="hero-select"
                                >
                                    <option value="">----- Chọn chuyên khoa -----</option>
                                    {specialties.map((s) => (
                                        <option key={s.id || s._id} value={s.id || s._id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="hero-location-wrapper">
                                <LocationSelector onChange={handleLocationChange} />
                            </div>

                            <button
                                onClick={handleSearch}
                                className="hero-search-button"
                            >
                                <Search size={20} />
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
