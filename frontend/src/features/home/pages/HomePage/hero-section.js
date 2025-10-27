import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../../../components/ui/Button";
import LocationSelector from "../../components/LocationSelector";
import { clinicApi, specialtyApi } from "../../../../api";
import { useNavigate } from "react-router-dom";

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
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 md:py-28">
            <div className="container relative mx-auto px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl"
                >
                    Đặt lịch khám bệnh{" "}
                    <span className="text-blue-600">dễ dàng</span> và{" "}
                    <span className="text-cyan-600">nhanh chóng</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10 text-lg text-gray-600 md:text-xl"
                >
                    Kết nối với hàng nghìn bác sĩ chuyên khoa và cơ sở y tế uy tín trên toàn quốc.
                    Đặt lịch chỉ trong vài phút.
                </motion.p>

                {/* Bộ lọc tìm kiếm */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mx-auto w-full max-w-4xl rounded-2xl bg-white/70 p-6 shadow-2xl backdrop-blur-md md:p-8"
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Chọn chuyên khoa */}
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
                            className="w-full rounded-lg border border-gray-300 bg-white/80 backdrop-blur-sm px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">----- Chọn chuyên khoa -----</option>
                            {specialties.map((s) => (
                                <option key={s.id || s._id} value={s.id || s._id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>

                        <LocationSelector onChange={handleLocationChange} />

                        <Button
                            onClick={handleSearch}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-md transition-all duration-200"
                        >
                            <Search className="mr-2 h-5 w-5" />
                            Tìm kiếm
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
