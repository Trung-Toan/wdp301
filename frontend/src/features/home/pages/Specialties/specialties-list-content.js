import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { specialtyApi } from "../../../../api";

const FILE_SERVER_URL = "http://localhost:5000/uploads";

// Helper function để xử lý URL ảnh
const getImageUrl = (url) => {
    if (!url) return null;
    // Nếu đã là URL đầy đủ (bắt đầu bằng http/https), trả về trực tiếp
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    // Nếu không, thêm FILE_SERVER_URL phía trước
    return `${FILE_SERVER_URL}/${url}`;
};

export default function SpecialtiesList() {
    const [specialties, setSpecialties] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchSpecialties() {
            try {
                const res = await specialtyApi.getAll();
                console.log("Danh sách chuyên khoa:", res.data);
                if (res.data.success) {
                    setSpecialties(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách chuyên khoa:", err);
            }
        }
        fetchSpecialties();
    }, []);

    const filteredSpecialties = specialties.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 md:py-16 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400 rounded-full -ml-36 -mb-36"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                                <Search className="text-white" size={36} />
                            </div>
                            <div>
                                <h1 className="mb-2 text-3xl font-bold md:text-4xl lg:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Tất cả chuyên khoa
                                </h1>
                            </div>
                        </div>
                        <p className="mb-8 text-lg text-gray-600 font-medium">
                            Khám phá đầy đủ các chuyên khoa y tế và tìm bác sĩ phù hợp với nhu cầu của bạn
                        </p>

                        {/* Search Bar */}
                        <div className="relative mx-auto max-w-xl">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chuyên khoa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 w-full rounded-xl border-2 border-gray-200 pl-12 pr-4 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-md hover:shadow-lg transition-shadow duration-300"
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
                                {filteredSpecialties.map((specialty, index) => (
                                    <Link
                                        key={index}
                                        to={`/home/specialty/detail/${specialty.id}`}
                                        className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden group"
                                    >
                                        <div className="flex flex-col items-center gap-4 p-6 text-center">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-200 group-hover:to-indigo-200 shadow-md">
                                                <img
                                                    src={specialty.icon_url ? getImageUrl(specialty.icon_url) : "/placeholder.svg"}
                                                    alt={specialty.name}
                                                    className="h-12 w-12 object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="mb-1 font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{specialty.name}</h3>
                                                <p className="text-sm text-gray-500">{specialty.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-lg text-gray-600">Không tìm thấy chuyên khoa phù hợp</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
