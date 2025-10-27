import React, { useState } from "react";
import { Star, Phone, Building2, CheckCircle2, Calendar, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const facilityData = {
    id: 1,
    name: "Bệnh viện Đa khoa Trung ương",
    type: "Bệnh viện công",
    address: "29 Nguyễn Bỉnh Khiêm, Hai Bà Trưng, Hà Nội",
    phone: "024 3826 3531",
    email: "info@bvdktw.vn",
    website: "www.bvdktw.vn",
    rating: 4.7,
    reviews: 342,
    doctors: 156,
    established: "1975",
    beds: 500,
    image: "/modern-hospital-exterior.png",
    verified: true,
    description:
        "Bệnh viện Đa khoa Trung ương là một trong những bệnh viện hàng đầu tại Việt Nam, với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị y tế hiện đại.",
    specialties: ["Tim mạch", "Nội khoa", "Ngoại khoa", "Sản phụ khoa", "Nhi khoa", "Thần kinh", "Tiêu hóa", "Hô hấp"],
    services: [
        "Khám bệnh tổng quát",
        "Khám chuyên khoa",
        "Xét nghiệm",
        "Chẩn đoán hình ảnh",
        "Phẫu thuật",
        "Cấp cứu 24/7",
        "Điều trị nội trú",
        "Khám sức khỏe định kỳ",
    ],
    workingHours: [
        { day: "Thứ 2 - Thứ 6", time: "7:00 - 17:00" },
        { day: "Thứ 7", time: "7:00 - 12:00" },
        { day: "Chủ nhật", time: "Nghỉ (Cấp cứu 24/7)" },
    ],
    facilities: [
        "Phòng khám hiện đại",
        "Phòng mổ vô trùng",
        "Phòng ICU",
        "Phòng xét nghiệm",
        "Phòng chẩn đoán hình ảnh",
        "Nhà thuốc",
        "Bãi đỗ xe",
        "Căn tin",
    ],
};

const mockDoctors = [
    { id: 1, name: "BS. Nguyễn Văn An", specialty: "Tim mạch", experience: "15 năm", rating: 4.8, image: "/doctor1.jpg" },
    { id: 2, name: "BS. Trần Thị Bình", specialty: "Nội khoa", experience: "12 năm", rating: 4.9, image: "/doctor2.jpg" },
    { id: 3, name: "BS. Lê Minh Cường", specialty: "Ngoại khoa", experience: "18 năm", rating: 4.7, image: "/doctor3.jpg" },
    { id: 4, name: "BS. Phạm Thị Dung", specialty: "Sản phụ khoa", experience: "20 năm", rating: 4.9, image: "/doctor4.jpg" },
];

const mockReviews = [
    { id: 1, name: "Nguyễn Văn A", rating: 5, date: "15/03/2024", comment: "Bệnh viện rất tốt, bác sĩ tận tâm." },
    { id: 2, name: "Trần Thị B", rating: 4, date: "10/03/2024", comment: "Đội ngũ y bác sĩ chuyên nghiệp, nhiệt tình." },
    { id: 3, name: "Lê Văn C", rating: 5, date: "05/03/2024", comment: "Rất hài lòng với dịch vụ." },
];

export default function FacilityDetail() {
    const [activeTab, setActiveTab] = useState("overview");
    const [currentPage, setCurrentPage] = useState(1);
    const doctorsPerPage = 2;

    const totalPages = Math.ceil(mockDoctors.length / doctorsPerPage);
    const startIndex = (currentPage - 1) * doctorsPerPage;
    const displayedDoctors = mockDoctors.slice(startIndex, startIndex + doctorsPerPage);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Back Button */}
            <div className="border-b bg-white">
                <div className="container mx-auto px-4 py-4">
                    <Link to="/home/facility" className="flex items-center text-gray-700 hover:text-blue-600">
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>

            {/* Header Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Info */}
                    <div className="lg:col-span-2">
                        <img src={facilityData.image} alt={facilityData.name} className="w-full h-64 object-cover rounded-lg mb-6" />
                        <h1 className="text-3xl font-bold">{facilityData.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{facilityData.rating}</span>
                            <span className="text-sm text-gray-500">({facilityData.reviews} đánh giá)</span>
                        </div>

                        <p className="text-gray-600 mt-4 leading-relaxed">{facilityData.description}</p>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="font-semibold text-lg mb-4">Đặt lịch khám</h3>
                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-3 flex items-center justify-center">
                                <Link to="/home/booking/facility" >
                                    <Calendar className="h-5 w-5 mr-2" /> Đặt lịch ngay
                                </Link>
                            </button>
                            <button className="w-full border py-2 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                                <Phone className="h-5 w-5 mr-2" /> Gọi điện tư vấn
                            </button>

                            <div className="mt-6 border-t pt-4">
                                <h4 className="font-semibold mb-2">Giờ làm việc</h4>
                                {facilityData.workingHours.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                                        <span>{item.day}</span>
                                        <span>{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex border-b mb-6">
                    {["overview", "doctors", "services", "reviews"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab === "overview"
                                ? "Tổng quan"
                                : tab === "doctors"
                                    ? "Bác sĩ"
                                    : tab === "services"
                                        ? "Dịch vụ"
                                        : "Đánh giá"}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Building2 className="h-5 w-5" /> Chuyên khoa
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {facilityData.specialties.map((sp) => (
                                    <span key={sp} className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-gray-700">
                                        {sp}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" /> Cơ sở vật chất
                            </h3>
                            <ul className="text-gray-700 text-sm space-y-2">
                                {facilityData.facilities.map((f) => (
                                    <li key={f} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === "doctors" && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {displayedDoctors.map((doctor) => (
                                <div key={doctor.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                                    <div className="flex gap-4">
                                        <img src={doctor.image} alt={doctor.name} className="w-20 h-20 rounded-lg object-cover" />
                                        <div>
                                            <h4 className="font-semibold text-lg">{doctor.name}</h4>
                                            <p className="text-sm text-gray-500">{doctor.specialty}</p>
                                            <p className="text-sm text-gray-500">{doctor.experience}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm">{doctor.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "border hover:bg-gray-100"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "services" && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-semibold mb-3">Dịch vụ y tế</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {facilityData.services.map((s) => (
                                <div key={s} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="space-y-4">
                        {mockReviews.map((r) => (
                            <div key={r.id} className="bg-white p-6 rounded-lg shadow">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-semibold">{r.name}</h4>
                                    <div className="flex">
                                        {Array.from({ length: r.rating }).map((_, i) => (
                                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{r.date}</p>
                                <p className="text-gray-700">{r.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
