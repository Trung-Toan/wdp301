import React, { useEffect, useState } from "react";
import { Search, MapPin, Phone, CheckCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { clinicApi } from "../../../api";
import Loading from "../../../components/Loading";

export default function FacilitiesList() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("Tất cả");

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

    if (loading)
        return <Loading />
    if (error)
        return <div className="text-center py-20 text-red-500">{error}</div>;

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
                {/* Sidebar filter */}
                <aside className="hidden lg:block w-64 bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold mb-3 text-gray-700">Địa điểm</h3>
                    <div className="space-y-2">
                        {locations.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => {
                                    setSelectedLocation(loc);
                                    setCurrentPage(1); // reset về trang 1 khi đổi lọc
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLocation === loc
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Danh sách */}
                <div className="flex-1">
                    <p className="text-gray-600 mb-4">
                        Tìm thấy{" "}
                        <span className="font-semibold text-gray-800">
                            {filteredClinics.length}
                        </span>{" "}
                        cơ sở y tế
                    </p>

                    <div className="space-y-6">
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
                                return (
                                    <div
                                        key={clinic.id}
                                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <Link to={`/facilities/${clinic.id}`}>
                                                <img
                                                    src={
                                                        clinic.logo_url || "/modern-hospital-exterior.png"
                                                    }
                                                    alt={clinic.name}
                                                    className="w-full md:w-48 h-32 rounded-lg object-cover"
                                                />
                                            </Link>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Link
                                                        to={`/home/facilities/${clinic.id}`}
                                                        className="text-xl font-bold hover:text-blue-600"
                                                    >
                                                        {clinic.name}
                                                    </Link>
                                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <p className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4" /> {address}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" /> {clinic.phone}
                                                    </p>
                                                    {clinic.email && (
                                                        <p className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-blue-600" />
                                                            {clinic.email}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {specialties.length > 0 ? (
                                                        specialties.slice(0, 4).map((s) => (
                                                            <span
                                                                key={s.id}
                                                                className="flex items-center gap-1 text-xs border rounded-full px-2 py-1 text-gray-700"
                                                            >
                                                                {/* Nếu có icon thì hiển thị kèm */}
                                                                {s.icon_url && (
                                                                    <img
                                                                        src={s.icon_url}
                                                                        alt={s.name}
                                                                        className="w-4 h-4 rounded-full object-cover"
                                                                    />
                                                                )}
                                                                {s.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        // fallback nếu không có chuyên khoa
                                                        <>
                                                            <span className="text-xs border rounded-full px-2 py-1 text-gray-700">
                                                                Đa khoa
                                                            </span>
                                                            <span className="text-xs border rounded-full px-2 py-1 text-gray-700">
                                                                Nội tổng hợp
                                                            </span>
                                                        </>
                                                    )}
                                                </div>


                                                <div className="flex gap-2 mt-4">
                                                    <Link
                                                        to={`/home/facilities/${clinic.id}`}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md"
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
                            <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-500">
                                Không tìm thấy cơ sở y tế phù hợp
                            </div>
                        )}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
                            >
                                ← Trước
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-2 rounded-md ${currentPage === i + 1
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
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
