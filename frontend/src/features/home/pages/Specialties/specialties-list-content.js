// src/pages/SpecialtiesList.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Heart,
    Stethoscope,
    Brain,
    Baby,
    Eye,
    Bone,
    Activity,
    Pill,
    Ear,
    Droplet,
    Thermometer,
    Syringe,
    Microscope,
    Ambulance,
    Users,
    Smile,
    Search,
} from "lucide-react";

// Mock data: tất cả các chuyên khoa
const allSpecialties = [
    { icon: Heart, name: "Tim mạch", count: "120+ bác sĩ", slug: "tim-mach", description: "Chẩn đoán và điều trị các bệnh về tim và mạch máu" },
    { icon: Stethoscope, name: "Nội khoa", count: "200+ bác sĩ", slug: "noi-khoa", description: "Khám và điều trị các bệnh nội khoa tổng quát" },
    { icon: Brain, name: "Thần kinh", count: "85+ bác sĩ", slug: "than-kinh", description: "Điều trị các bệnh về hệ thần kinh và não bộ" },
    { icon: Baby, name: "Sản phụ khoa", count: "150+ bác sĩ", slug: "san-phu-khoa", description: "Chăm sóc sức khỏe phụ nữ và thai sản" },
    { icon: Eye, name: "Mắt", count: "95+ bác sĩ", slug: "mat", description: "Khám và điều trị các bệnh về mắt" },
    { icon: Bone, name: "Xương khớp", count: "110+ bác sĩ", slug: "xuong-khop", description: "Điều trị các bệnh về xương, khớp và cơ" },
    { icon: Activity, name: "Ngoại khoa", count: "130+ bác sĩ", slug: "ngoai-khoa", description: "Phẫu thuật và điều trị ngoại khoa" },
    { icon: Pill, name: "Da liễu", count: "75+ bác sĩ", slug: "da-lieu", description: "Điều trị các bệnh về da và thẩm mỹ da" },
    { icon: Ear, name: "Tai mũi họng", count: "90+ bác sĩ", slug: "tai-mui-hong", description: "Khám và điều trị các bệnh về tai, mũi, họng" },
    { icon: Droplet, name: "Tiết niệu", count: "65+ bác sĩ", slug: "tiet-nieu", description: "Điều trị các bệnh về thận và đường tiết niệu" },
    { icon: Thermometer, name: "Nhi khoa", count: "180+ bác sĩ", slug: "nhi-khoa", description: "Chăm sóc sức khỏe trẻ em" },
    { icon: Syringe, name: "Tiêm chủng", count: "50+ bác sĩ", slug: "tiem-chung", description: "Dịch vụ tiêm chủng và phòng ngừa bệnh" },
    { icon: Microscope, name: "Xét nghiệm", count: "40+ bác sĩ", slug: "xet-nghiem", description: "Xét nghiệm và chẩn đoán y khoa" },
    { icon: Ambulance, name: "Cấp cứu", count: "100+ bác sĩ", slug: "cap-cuu", description: "Dịch vụ cấp cứu và chăm sóc khẩn cấp" },
    { icon: Users, name: "Tâm lý", count: "70+ bác sĩ", slug: "tam-ly", description: "Tư vấn và điều trị các vấn đề tâm lý" },
    { icon: Smile, name: "Răng hàm mặt", count: "120+ bác sĩ", slug: "rang-ham-mat", description: "Khám và điều trị các bệnh về răng miệng" },
];

export default function SpecialtiesList() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSpecialties = allSpecialties.filter((specialty) =>
        specialty.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 via-blue-100 to-white py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                            Tất cả chuyên khoa
                        </h1>
                        <p className="mb-8 text-lg text-gray-600">
                            Khám phá đầy đủ các chuyên khoa y tế và tìm bác sĩ phù hợp với nhu cầu của bạn
                        </p>

                        {/* Search Bar */}
                        <div className="relative mx-auto max-w-xl">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chuyên khoa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 w-full rounded-lg border border-gray-300 pl-12 pr-4 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Specialties Grid */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    {filteredSpecialties.length > 0 ? (
                        <>
                            <p className="mb-8 text-center text-gray-600">
                                Tìm thấy {filteredSpecialties.length} chuyên khoa
                            </p>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredSpecialties.map((specialty) => {
                                    const Icon = specialty.icon;
                                    return (
                                        <Link
                                            key={specialty.slug}
                                            to={`/home/specialty/detail/${specialty.slug}`}
                                            className="block bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="flex flex-col items-center gap-4 p-6 text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <Icon className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold text-gray-800">{specialty.name}</h3>
                                                    <p className="mb-2 text-sm text-gray-500">{specialty.count}</p>
                                                    <p className="text-xs text-gray-500">{specialty.description}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-lg text-gray-600">
                                Không tìm thấy chuyên khoa phù hợp
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
