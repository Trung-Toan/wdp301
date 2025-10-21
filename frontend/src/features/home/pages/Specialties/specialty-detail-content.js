// src/pages/SpecialtyDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import {
    Heart,
    Stethoscope,
    Brain,
    Baby,
    Eye,
    Star,
    MapPin,
    Clock,
} from "lucide-react";

// Dữ liệu chuyên khoa
const specialtiesData = {
    "tim-mach": {
        icon: Heart,
        name: "Tim mạch",
        description:
            "Chuyên khoa Tim mạch chuyên điều trị các bệnh lý về tim và mạch máu như cao huyết áp, suy tim, nhồi máu cơ tim, rối loạn nhịp tim và các bệnh mạch vành.",
        commonDiseases: [
            "Cao huyết áp",
            "Bệnh mạch vành",
            "Suy tim",
            "Nhồi máu cơ tim",
            "Rối loạn nhịp tim",
            "Bệnh van tim",
        ],
        services: [
            "Khám và tư vấn tim mạch",
            "Siêu âm tim",
            "Điện tâm đồ (ECG)",
            "Holter huyết áp 24h",
            "Test gắng sức",
            "Can thiệp tim mạch",
        ],
    },
    "noi-khoa": {
        icon: Stethoscope,
        name: "Nội khoa",
        description:
            "Chuyên khoa Nội khoa tổng quát chẩn đoán và điều trị các bệnh lý nội khoa như tiểu đường, bệnh thận, bệnh gan, bệnh phổi và các rối loạn chuyển hóa.",
        commonDiseases: [
            "Tiểu đường",
            "Bệnh thận",
            "Bệnh gan",
            "Bệnh phổi",
            "Rối loạn chuyển hóa",
            "Bệnh dạ dày",
        ],
        services: [
            "Khám nội khoa tổng quát",
            "Xét nghiệm máu",
            "Siêu âm ổ bụng",
            "Nội soi dạ dày",
            "Đo chức năng hô hấp",
            "Tư vấn dinh dưỡng",
        ],
    },
    "than-kinh": {
        icon: Brain,
        name: "Thần kinh",
        description:
            "Chuyên khoa Thần kinh chuyên điều trị các bệnh lý về hệ thần kinh như đột quỵ, động kinh, Parkinson, đau đầu mãn tính và các rối loạn thần kinh khác.",
        commonDiseases: [
            "Đột quỵ",
            "Động kinh",
            "Bệnh Parkinson",
            "Đau đầu mãn tính",
            "Rối loạn giấc ngủ",
            "Thoái hóa thần kinh",
        ],
        services: [
            "Khám thần kinh",
            "Điện não đồ (EEG)",
            "MRI não",
            "CT scan não",
            "Điện cơ",
            "Tư vấn điều trị",
        ],
    },
    "san-phu-khoa": {
        icon: Baby,
        name: "Sản phụ khoa",
        description:
            "Chuyên khoa Sữ phụ khoa chăm sóc sức khỏe sinh sản của phụ nữ, theo dõi thai kỳ, điều trị các bệnh phụ khoa và hỗ trợ sinh sản.",
        commonDiseases: [
            "Viêm phụ khoa",
            "U xơ tử cung",
            "Rối loạn kinh nguyệt",
            "Vô sinh",
            "Polyp tử cung",
            "Nang buồng trứng",
        ],
        services: [
            "Khám sản phụ khoa",
            "Siêu âm thai",
            "Siêu âm 4D",
            "Xét nghiệm sàng lọc",
            "Tư vấn mang thai",
            "Điều trị vô sinh",
        ],
    },
    mat: {
        icon: Eye,
        name: "Mắt",
        description:
            "Chuyên khoa Mắt chẩn đoán và điều trị các bệnh lý về mắt như cận thị, viễn thị, đục thủy tinh thể, glaucoma và các bệnh võng mạc.",
        commonDiseases: [
            "Cận thị, viễn thị",
            "Đục thủy tinh thể",
            "Glaucoma",
            "Bệnh võng mạc",
            "Viêm kết mạc",
            "Khô mắt",
        ],
        services: [
            "Khám mắt tổng quát",
            "Đo thị lực",
            "Đo nhãn áp",
            "Chụp đáy mắt",
            "Phẫu thuật mắt",
            "Kính áp tròng",
        ],
    },
};

// Dữ liệu bác sĩ mẫu
const mockDoctorsBySpecialty = {
    "tim-mach": [
        {
            id: 1,
            name: "BS. Nguyễn Văn An",
            hospital: "Bệnh viện Đa khoa Trung ương",
            location: "Hà Nội",
            rating: 4.8,
            reviews: 156,
            experience: "15 năm kinh nghiệm",
            price: "500.000đ",
            image: "/doctor-portrait-male.jpg",
            available: true,
        },
        {
            id: 2,
            name: "BS. Vũ Thị Hương",
            hospital: "Bệnh viện Tim Hà Nội",
            location: "Hà Nội",
            rating: 4.9,
            reviews: 198,
            experience: "18 năm kinh nghiệm",
            price: "600.000đ",
            image: "/doctor-portrait-female.jpg",
            available: true,
        },
    ],
};

export default function SpecialtyDetail() {
    const { slug } = useParams();
    const specialty = specialtiesData[slug];
    const doctors = mockDoctorsBySpecialty[slug] || [];

    if (!specialty) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-semibold mb-4">Không tìm thấy chuyên khoa</h1>
                <Link to="/home" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600">
                    Về trang chủ
                </Link>
            </div>
        );
    }

    const Icon = specialty.icon;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 py-16">
                <div className="max-w-5xl mx-auto text-center text-white px-4">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full">
                            <Icon className="w-10 h-10" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Chuyên khoa {specialty.name}</h1>
                    <p className="text-lg opacity-90">{specialty.description}</p>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4">Bệnh thường gặp</h2>
                        <ul className="space-y-2 text-gray-700">
                            {specialty.commonDiseases.map((d, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-blue-500 mt-1">•</span> {d}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-xl font-bold mb-4">Dịch vụ khám</h2>
                        <ul className="space-y-2 text-gray-700">
                            {specialty.services.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-blue-500 mt-1">•</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Doctors */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold">
                        Bác sĩ chuyên khoa {specialty.name}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Tìm thấy <span className="font-semibold text-gray-900">{doctors.length}</span> bác sĩ
                    </p>

                    {doctors.map((doctor) => (
                        <div
                            key={doctor.id}
                            className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col md:flex-row gap-6"
                        >
                            <img
                                src={doctor.image}
                                alt={doctor.name}
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold mb-1 hover:text-blue-600 cursor-pointer">
                                    {doctor.name}
                                </h3>
                                <div className="text-sm text-gray-600 flex flex-col gap-1">
                                    <p className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {doctor.hospital} - {doctor.location}
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {doctor.experience}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="font-medium">{doctor.rating}</span>
                                        <span className="text-gray-500">
                                            ({doctor.reviews} đánh giá)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-between">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Giá khám</p>
                                    <p className="text-lg font-semibold text-blue-600">
                                        {doctor.price}
                                    </p>
                                </div>
                                <Link
                                    to={`/home/doctordetail/${doctor.id}`}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Đặt lịch khám
                                </Link>
                            </div>
                        </div>
                    ))}

                    {doctors.length === 0 && (
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
        </div>
    );
}
