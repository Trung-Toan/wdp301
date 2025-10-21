import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { specialtyApi } from "../../../../api";


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
                                {filteredSpecialties.map((specialty, index) => (
                                    <Link
                                        key={index}
                                        to={`/home/specialty/detail/${specialty.id}`}
                                        className="block bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="flex flex-col items-center gap-4 p-6 text-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors">
                                                <img
                                                    src={specialty.icon_url}
                                                    alt={specialty.name}
                                                    className="h-10 w-10 object-contain"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="mb-1 font-semibold text-gray-800">{specialty.name}</h3>
                                                <p className="text-xs text-gray-500">{specialty.description}</p>
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
