import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { doctorApi } from "../../../../api";

export default function SpecialtyDetail() {
    const { id } = useParams(); // Lấy specialtyId từ URL
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const res = await doctorApi.getDoctorBySpecialty(id, {
                    page: currentPage,
                    limit,
                });
                const data = res.data;
                console.log("information specialty detail: ", data);
                setDoctors(data.items || []);
                setTotalPages(data.meta?.totalPages || 1);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách bác sĩ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [id, currentPage]);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // Định dạng địa chỉ
    const formatAddress = (address) => {
        if (!address) return "Không rõ địa chỉ";
        const { houseNumber, street, ward, province } = address;
        return `${houseNumber ? houseNumber + " " : ""}${street ? street + ", " : ""}${ward?.name ? ward.name + ", " : ""}${province?.name || ""}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 py-16 text-center text-white">
                <h1 className="text-4xl font-bold mb-3">Bác sĩ chuyên khoa</h1>
                <p className="text-lg opacity-90">
                    Danh sách bác sĩ thuộc chuyên khoa này
                </p>
            </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {loading ? (
                    <p className="text-gray-500 italic text-center">
                        Đang tải danh sách bác sĩ...
                    </p>
                ) : doctors.length > 0 ? (
                    <>
                        <div className="space-y-6">
                            {doctors.map((doctor) => (
                                <div
                                    key={doctor._id}
                                    className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col md:flex-row gap-6"
                                >
                                    <img
                                        src={doctor.image || "/doctor-placeholder.jpg"}
                                        alt={doctor.title}
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold mb-1 hover:text-blue-600 cursor-pointer">
                                            {doctor.title || "Bác sĩ"}
                                        </h3>
                                        <p className="text-sm text-gray-600 italic mb-2">
                                            {doctor.degree || "Chưa cập nhật chuyên môn"}
                                        </p>
                                        <div className="text-sm text-gray-600 flex flex-col gap-1">
                                            <p className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {doctor.clinic?.name || "Không rõ phòng khám"} –{" "}
                                                {formatAddress(doctor.clinic?.address)}
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {doctor.experience || "Chưa cập nhật kinh nghiệm"}
                                            </p>
                                            <p className="text-gray-700 mt-2 line-clamp-3">
                                                {doctor.description || "Chưa có mô tả"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-medium">
                                                {doctor.rating ? doctor.rating.toFixed(1) : "Chưa có"}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                ({doctor.reviewCount || 0} đánh giá)
                                            </span>
                                        </div>

                                        <Link
                                            to={`/home/doctordetail/${doctor._id}`}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Phân trang */}
                        <div className="flex justify-between items-center mt-6">
                            <p className="text-sm text-gray-600">
                                Trang {currentPage}/{totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`flex items-center gap-1 px-3 py-1 border rounded-lg transition ${currentPage === 1
                                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                        : "text-blue-600 border-blue-200 hover:bg-blue-50"
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4" /> Trước
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center gap-1 px-3 py-1 border rounded-lg transition ${currentPage === totalPages
                                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                        : "text-blue-600 border-blue-200 hover:bg-blue-50"
                                        }`}
                                >
                                    Sau <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <p className="text-gray-600 mb-4">
                            Chưa có bác sĩ trong chuyên khoa này
                        </p>
                        <Link
                            to="/home/doctorlist"
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                        >
                            Xem tất cả bác sĩ
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
