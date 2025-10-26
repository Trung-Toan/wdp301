import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    MapPin,
    Clock,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
} from "lucide-react";
import { doctorApi } from "../../../../api";

export default function SpecialtyDetail() {
    const { id } = useParams();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5; // mỗi trang 5 bác sĩ

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const res = await doctorApi.getDoctorBySpecialty(id, {
                    page: currentPage,
                    limit,
                });
                const data = res.data;
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

    const formatAddress = (address) => {
        if (!address) return "Không rõ địa chỉ";
        const { houseNumber, street, ward, province } = address;
        return `${houseNumber ? houseNumber + " " : ""}${street ? street + ", " : ""}${ward?.name ? ward.name + ", " : ""}${province?.name || ""}`;
    };

    return (
        <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-purple-600 py-16 text-center text-white shadow-md">
                <h1 className="text-4xl font-bold mb-2">Bác sĩ chuyên khoa</h1>
                <p className="text-lg opacity-90">
                    Danh sách bác sĩ thuộc chuyên khoa này
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-8 py-12">
                {loading ? (
                    <div className="text-center text-gray-500 italic py-10">
                        Đang tải danh sách bác sĩ...
                    </div>
                ) : doctors.length > 0 ? (
                    <>
                        {/* Doctor List */}
                        <div className="space-y-6">
                            {doctors.map((doctor) => (
                                <div
                                    key={doctor._id}
                                    className="bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 flex gap-6 items-start"
                                >
                                    {/* Avatar */}
                                    <img
                                        src={
                                            doctor?.user_id?.avatar_url ||
                                            "/doctor-placeholder.jpg"
                                        }
                                        alt={doctor.title}
                                        className="w-40 h-40 rounded-xl object-cover border-4 border-blue-100 shadow"
                                    />

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                            {doctor.title || "Bác sĩ"}{" "}
                                            <span className="text-blue-700">
                                                {doctor?.user_id?.full_name}
                                            </span>
                                        </h3>

                                        <p className="text-gray-600 flex items-center gap-2 mb-2 text-sm">
                                            <GraduationCap className="w-4 h-4 text-blue-500" />
                                            {doctor.degree ||
                                                "Chưa cập nhật chuyên môn"}
                                        </p>

                                        <p className="flex items-center gap-2 text-gray-700 text-sm mb-2">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            {doctor.clinic?.name ||
                                                "Không rõ phòng khám"}{" "}
                                            –{" "}
                                            {formatAddress(
                                                doctor.clinic?.address
                                            )}
                                        </p>

                                        <p className="flex items-center gap-2 text-gray-700 text-sm mb-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            {doctor.experience ||
                                                "Chưa cập nhật kinh nghiệm"}
                                        </p>

                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mt-3 text-justify">
                                            {doctor.description ||
                                                "Chưa có mô tả chi tiết"}
                                        </p>

                                        {/* Actions */}
                                        <div className="mt-4 flex justify-end">
                                            <Link
                                                to={`/home/doctordetail/${doctor._id}`}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-12">
                            <p className="text-sm text-gray-600">
                                Trang{" "}
                                <span className="font-semibold">
                                    {currentPage}
                                </span>{" "}
                                / {totalPages}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition ${currentPage === 1
                                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                        : "text-blue-600 border-blue-300 hover:bg-blue-50"
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4" /> Trước
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition ${currentPage === totalPages
                                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                        : "text-blue-600 border-blue-300 hover:bg-blue-50"
                                        }`}
                                >
                                    Sau <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <p className="text-gray-600 text-lg mb-4">
                            Chưa có bác sĩ trong chuyên khoa này
                        </p>
                        <Link
                            to="/home/doctorlist"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Xem tất cả bác sĩ
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
