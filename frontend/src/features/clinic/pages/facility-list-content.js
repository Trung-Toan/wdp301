import React, { useState } from "react";
import {
    Search,
    MapPin,
    Star,
    Phone,
    Building2,
    CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// Dữ liệu giả
const mockFacilities = [
    {
        id: 1,
        name: "Bệnh viện Đa khoa Trung ương",
        type: "Bệnh viện công",
        address: "29 Nguyễn Bỉnh Khiêm, Hai Bà Trưng, Hà Nội",
        location: "Hà Nội",
        rating: 4.7,
        reviews: 342,
        phone: "024 3826 3531",
        specialties: ["Tim mạch", "Nội khoa", "Ngoại khoa", "Sản phụ khoa"],
        doctors: 156,
        image: "/modern-hospital-exterior.png",
        verified: true,
    },
    {
        id: 2,
        name: "Bệnh viện Bạch Mai",
        type: "Bệnh viện công",
        address: "78 Giải Phóng, Đống Đa, Hà Nội",
        location: "Hà Nội",
        rating: 4.8,
        reviews: 521,
        phone: "024 3869 3731",
        specialties: ["Tiêu hóa", "Hô hấp", "Thần kinh", "Ung bướu"],
        doctors: 234,
        image: "/modern-hospital.png",
        verified: true,
    },
    {
        id: 3,
        name: "Phòng khám Đa khoa Medlatec",
        type: "Phòng khám tư",
        address: "42-44 Nghĩa Dũng, Ba Đình, Hà Nội",
        location: "Hà Nội",
        rating: 4.6,
        reviews: 189,
        phone: "024 7106 6858",
        specialties: ["Nội khoa", "Nhi khoa", "Da liễu", "Tai mũi họng"],
        doctors: 45,
        image: "/medical-clinic.png",
        verified: true,
    },
    // 👇 bạn có thể thêm nhiều dữ liệu hơn ở đây để test phân trang
];

const facilityTypes = [
    "Tất cả",
    "Bệnh viện công",
    "Bệnh viện tư",
    "Phòng khám tư",
    "Trung tâm y tế",
];
const locations = ["Tất cả", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"];

export default function FacilitiesList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("Tất cả");
    const [selectedLocation, setSelectedLocation] = useState("Tất cả");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Lọc dữ liệu
    const filteredFacilities = mockFacilities.filter((facility) => {
        const matchesSearch =
            facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            facility.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            facility.specialties.some((s) =>
                s.toLowerCase().includes(searchQuery.toLowerCase())
            );
        const matchesType =
            selectedType === "Tất cả" || facility.type === selectedType;
        const matchesLocation =
            selectedLocation === "Tất cả" || facility.location === selectedLocation;
        return matchesSearch && matchesType && matchesLocation;
    });

    // Tính toán dữ liệu phân trang
    const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentFacilities = filteredFacilities.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header tìm kiếm */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white mb-6 text-center">
                        Tìm kiếm cơ sở y tế
                    </h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên bệnh viện, phòng khám, địa chỉ..."
                            className="w-full pl-12 pr-4 h-14 rounded-lg shadow-md border border-gray-200 focus:ring-2 focus:ring-blue-400"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // reset về trang 1 khi tìm kiếm
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bộ lọc + danh sách */}
            <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
                {/* Sidebar filters */}
                <aside className="hidden lg:block w-64 bg-white rounded-xl shadow-md p-6">
                    <div>
                        <h3 className="font-semibold mb-3 text-gray-700">Loại hình</h3>
                        <div className="space-y-2">
                            {facilityTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setSelectedType(type);
                                        setCurrentPage(1);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedType === type
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <h3 className="font-semibold mb-3 text-gray-700">Địa điểm</h3>
                        <div className="space-y-2">
                            {locations.map((location) => (
                                <button
                                    key={location}
                                    onClick={() => {
                                        setSelectedLocation(location);
                                        setCurrentPage(1);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLocation === location
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {location}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1">
                    <p className="text-gray-600 mb-4">
                        Tìm thấy{" "}
                        <span className="font-semibold text-gray-800">
                            {filteredFacilities.length}
                        </span>{" "}
                        cơ sở y tế
                    </p>

                    {/* Danh sách cơ sở */}
                    <div className="space-y-6">
                        {currentFacilities.length > 0 ? (
                            currentFacilities.map((facility) => (
                                <div
                                    key={facility.id}
                                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <Link to={`/facilities/${facility.id}`}>
                                            <img
                                                src={facility.image}
                                                alt={facility.name}
                                                className="w-full md:w-48 h-32 rounded-lg object-cover"
                                            />
                                        </Link>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Link
                                                    to={`/facilities/${facility.id}`}
                                                    className="text-xl font-bold hover:text-blue-600"
                                                >
                                                    {facility.name}
                                                </Link>
                                                {facility.verified && (
                                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                                )}
                                            </div>

                                            <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-md mb-3">
                                                {facility.type}
                                            </span>

                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4" /> {facility.address}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" /> {facility.phone}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" /> {facility.doctors} bác sĩ
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="font-semibold">{facility.rating}</span>
                                                    <span className="text-gray-500">
                                                        ({facility.reviews} đánh giá)
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {facility.specialties.slice(0, 4).map((s) => (
                                                    <span
                                                        key={s}
                                                        className="text-xs border rounded-full px-2 py-1 text-gray-700"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <Link
                                                    to={`/home/facilities/${facility.id}`}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md"
                                                >
                                                    Xem chi tiết
                                                </Link>
                                                <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-md">
                                                    Đặt lịch khám
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-500">
                                Không tìm thấy cơ sở y tế phù hợp
                            </div>
                        )}
                    </div>

                    {/* 🔽 Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded-md disabled:opacity-50"
                            >
                                Trước
                            </button>

                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 rounded-md ${currentPage === i + 1
                                        ? "bg-blue-600 text-white"
                                        : "border hover:bg-gray-100"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded-md disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
