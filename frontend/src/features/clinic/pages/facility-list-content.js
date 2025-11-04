import React, { useEffect, useState } from "react";
import { Search, MapPin, Phone, CheckCircle, Mail, Filter, X, Building2, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { clinicApi } from "../../../api";

export default function FacilitiesList() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("Tất cả");
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [loadedImages, setLoadedImages] = useState(new Set());

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // số lượng cơ sở mỗi trang

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const res = await clinicApi.getAllClinic();
                if (res.data?.success) {
                    setClinics(res.data.data);
                } else {
                    throw new Error("Không lấy được dữ liệu phòng khám");
                }
            } catch (err) {
                console.error(err);
                setError("Lỗi khi tải danh sách cơ sở y tế");
            } finally {
                setLoading(false);
            }
        };
        fetchClinics();
    }, []);

    // Hàm xóa dấu tiếng Việt
    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD") // tách dấu ra khỏi ký tự gốc
            .replace(/[\u0300-\u036f]/g, "") // xóa các dấu
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase(); // chuyển về chữ thường
    };

    // Lọc dữ liệu theo tên / địa chỉ / location
    const filteredClinics = clinics.filter((c) => {
        const addressText = `${c.address?.houseNumber || ""} ${c.address?.street || ""} ${c.address?.ward?.name || ""} ${c.address?.province?.name || ""}`;

        const normalizedName = removeVietnameseTones(c.name);
        const normalizedAddress = removeVietnameseTones(addressText);
        const normalizedSearch = removeVietnameseTones(searchQuery);

        const matchesSearch =
            normalizedName.includes(normalizedSearch) ||
            normalizedAddress.includes(normalizedSearch);

        const matchesLocation =
            selectedLocation === "Tất cả" ||
            c.address?.province?.name === selectedLocation;

        return matchesSearch && matchesLocation;
    });


    // Phân trang
    const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentClinics = filteredClinics.slice(startIndex, startIndex + itemsPerPage);

    const locations = [
        "Tất cả",
        ...Array.from(
            new Set(clinics.map((c) => c.address?.province?.name).filter(Boolean))
        ),
    ];

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" }); // cuộn lên đầu khi đổi trang
        }
    };

    const handleImageError = (e, clinicId) => {
        e.target.src = "/modern-hospital-exterior.png";
        e.target.onerror = null; // Prevent infinite loop
    };

    const handleImageLoad = (clinicId) => {
        setLoadedImages(prev => new Set(prev).add(clinicId));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Đang tải danh sách cơ sở y tế...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-700 text-lg font-semibold mb-2">Lỗi tải dữ liệu</p>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            {/* Header tìm kiếm */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 py-12 md:py-16 relative overflow-hidden rounded-3xl mx-4 mt-4">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -ml-36 -mb-36"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Tìm kiếm cơ sở y tế
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
                            Khám phá các phòng khám và bệnh viện uy tín tại khu vực của bạn
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên bệnh viện, phòng khám, địa chỉ..."
                                className="w-full pl-12 pr-4 h-14 md:h-16 rounded-2xl shadow-lg border-0 focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 outline-none text-gray-800 text-base"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc + danh sách */}
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Mobile Filter Button */}
                <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow mb-4"
                >
                    <Filter className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Bộ lọc</span>
                    {selectedLocation !== "Tất cả" && (
                        <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {selectedLocation}
                        </span>
                    )}
                </button>

                {/* Mobile Filter Overlay */}
                {isMobileFilterOpen && (
                    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start">
                        <div className="bg-white w-full max-h-screen overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">Bộ lọc</h3>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                {locations.map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => {
                                            setSelectedLocation(loc);
                                            setCurrentPage(1);
                                            setIsMobileFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${selectedLocation === loc
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebar filter - Desktop */}
                <aside className="hidden lg:block w-72 bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg text-gray-800">Địa điểm</h3>
                    </div>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {locations.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => {
                                    setSelectedLocation(loc);
                                    setCurrentPage(1);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${selectedLocation === loc
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-[1.02]"
                                    : "hover:bg-gray-50 text-gray-700 hover:shadow-sm"
                                    }`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Danh sách */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600 text-base md:text-lg">
                            Tìm thấy{" "}
                            <span className="font-bold text-blue-600 text-xl">
                                {filteredClinics.length}
                            </span>{" "}
                            cơ sở y tế
                        </p>
                        {selectedLocation !== "Tất cả" && (
                            <button
                                onClick={() => {
                                    setSelectedLocation("Tất cả");
                                    setCurrentPage(1);
                                }}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <X className="h-4 w-4" />
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        {currentClinics.length > 0 ? (
                            currentClinics.map((clinic) => {
                                const address = clinic.address
                                    ? [
                                        clinic.address.alley,
                                        clinic.address.houseNumber,
                                        clinic.address.street,
                                        clinic.address.ward?.name,
                                        clinic.address.province?.name,
                                    ]
                                        .filter(Boolean) // loại bỏ phần null / undefined / rỗng
                                        .join(", ") // nối các phần bằng dấu phẩy và khoảng trắng
                                    : "Chưa cập nhật địa chỉ";

                                const specialties =
                                    Array.isArray(clinic.specialties) && clinic.specialties.length
                                        ? clinic.specialties
                                        : ["Đa khoa", "Nội tổng hợp"];

                                const isImageLoaded = loadedImages.has(clinic.id);
                                const imageSrc = clinic.logo_url || "/modern-hospital-exterior.png";

                                return (
                                    <div
                                        key={clinic.id}
                                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <Link
                                                to={`/home/facilities/${clinic.id}`}
                                                className="flex-shrink-0"
                                            >
                                                <div className="relative w-full md:w-56 h-40 md:h-44 rounded-xl overflow-hidden group bg-gray-100">
                                                    {/* Placeholder/Skeleton - chỉ hiển thị khi chưa load */}
                                                    {!isImageLoaded && (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center z-10">
                                                            <Building2 className="h-12 w-12 text-gray-400 animate-pulse" />
                                                        </div>
                                                    )}

                                                    {/* Actual Image */}
                                                    <img
                                                        src={imageSrc}
                                                        alt={clinic?.name || "Cơ sở y tế"}
                                                        onLoad={() => handleImageLoad(clinic.id)}
                                                        onError={(e) => handleImageError(e, clinic.id)}
                                                        className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'
                                                            } group-hover:scale-105 transition-transform duration-300 ease-out`}
                                                        loading="lazy"
                                                        style={{
                                                            backfaceVisibility: 'hidden',
                                                            WebkitBackfaceVisibility: 'hidden',
                                                            transform: 'translateZ(0)' // Force GPU acceleration
                                                        }}
                                                    />

                                                    {/* Hover overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"></div>
                                                </div>
                                            </Link>

                                            <div className="flex-1 flex flex-col">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <Link
                                                        to={`/home/facilities/${clinic.id}`}
                                                        className="text-xl md:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors flex-1"
                                                    >
                                                        {clinic.name}
                                                    </Link>
                                                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-500 flex-shrink-0 mt-1" />
                                                </div>

                                                <div className="space-y-2.5 text-sm md:text-base text-gray-600 mb-4 flex-1">
                                                    <p className="flex items-start gap-2.5">
                                                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                        <span className="flex-1">{address}</span>
                                                    </p>
                                                    <p className="flex items-center gap-2.5">
                                                        <Phone className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                                                        <span>{clinic.phone || "Chưa cập nhật"}</span>
                                                    </p>
                                                    {clinic.email && (
                                                        <p className="flex items-center gap-2.5">
                                                            <Mail className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                                                            <span className="break-all">{clinic.email}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {specialties.length > 0 ? (
                                                        specialties.slice(0, 4).map((s, idx) => (
                                                            <span
                                                                key={s.id || idx}
                                                                className="flex items-center gap-1.5 text-xs md:text-sm border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                            >
                                                                {s.icon_url && (
                                                                    <img
                                                                        src={s.icon_url}
                                                                        alt={s.name}
                                                                        className="w-4 h-4 rounded-full object-cover"
                                                                        onError={(e) => e.target.style.display = 'none'}
                                                                    />
                                                                )}
                                                                {s.name || s}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <span className="text-xs md:text-sm border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 bg-gray-50">
                                                                Đa khoa
                                                            </span>
                                                            <span className="text-xs md:text-sm border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 bg-gray-50">
                                                                Nội tổng hợp
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="mt-auto">
                                                    <Link
                                                        to={`/home/facilities/${clinic.id}`}
                                                        className="inline-flex items-center justify-center w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium text-center py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                                                    >
                                                        Xem chi tiết
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white rounded-2xl shadow-md p-12 md:p-16 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        Không tìm thấy cơ sở y tế
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {searchQuery || selectedLocation !== "Tất cả"
                                            ? `Không có cơ sở y tế nào khớp với bộ lọc của bạn`
                                            : "Hiện tại chưa có cơ sở y tế nào"}
                                    </p>
                                    {(searchQuery || selectedLocation !== "Tất cả") && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSelectedLocation("Tất cả");
                                                setCurrentPage(1);
                                            }}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center items-center gap-2 mt-10 md:mt-12">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700 shadow-sm"
                            >
                                ← Trước
                            </button>

                            {/* Hiển thị số trang với logic thông minh */}
                            {Array.from({ length: totalPages }, (_, i) => {
                                const pageNum = i + 1;
                                // Chỉ hiển thị trang đầu, cuối, trang hiện tại và các trang xung quanh
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === pageNum
                                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-105"
                                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (
                                    pageNum === currentPage - 2 ||
                                    pageNum === currentPage + 2
                                ) {
                                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700 shadow-sm"
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
