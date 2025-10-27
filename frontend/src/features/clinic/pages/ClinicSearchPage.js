import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Building2, MapPin, Phone, Globe, Star, Search } from "lucide-react";
import { clinicApi } from "../../../api";
import Loading from "../../../components/Loading";
import Badge from "../../../components/ui/Badge";

export default function ClinicSearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchClinics = async () => {
            setLoading(true);
            try {
                const params = {
                    specialtyId: searchParams.get("specialtyId") || "",
                    provinceCode: searchParams.get("provinceCode") || "",
                    wardCode: searchParams.get("wardCode") || "",
                    q: searchParams.get("q") || "",
                    page: currentPage,
                    limit: itemsPerPage,
                };

                // Remove empty params
                Object.keys(params).forEach(key => {
                    if (!params[key]) delete params[key];
                });

                const res = await clinicApi.searchClinics(params);
                console.log("Clinic search results:", res.data);

                const items = res.data?.items || res.data?.data?.items || [];
                const total = res.data?.meta?.total || res.data?.total || 0;

                setClinics(items);
                setTotalPages(Math.ceil(total / itemsPerPage) || 1);
            } catch (error) {
                console.error("Error fetching clinics:", error);
                setClinics([]);
            } finally {
                setLoading(false);
            }
        };

        fetchClinics();
    }, [searchParams, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Kết quả tìm kiếm phòng khám
                </h1>
                <p className="text-gray-600 mb-8">
                    Tìm thấy {clinics.length > 0 ? clinics.length : 0} phòng khám phù hợp
                </p>

                {clinics.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-xl text-gray-600">Không tìm thấy phòng khám nào</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clinics.map((clinic) => (
                                <div
                                    key={clinic._id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/clinics/${clinic._id}`)}
                                >
                                    {/* Clinic Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                                        {clinic.logo_url ? (
                                            <img
                                                src={clinic.logo_url}
                                                alt={clinic.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Building2 className="h-24 w-24 text-white opacity-80" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Clinic Info */}
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                            {clinic.name}
                                        </h3>

                                        {/* Address */}
                                        {clinic.address && (
                                            <div className="flex items-start gap-2 mb-3 text-gray-600 text-sm">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                                                <span className="line-clamp-2">
                                                    {clinic.address.houseNumber && `${clinic.address.houseNumber} `}
                                                    {clinic.address.street && `${clinic.address.street}, `}
                                                    {clinic.address.ward?.name || ""}
                                                    {clinic.address.province?.name && `, ${clinic.address.province.name}`}
                                                </span>
                                            </div>
                                        )}

                                        {/* Phone */}
                                        {clinic.phone && (
                                            <div className="flex items-center gap-2 mb-3 text-gray-600 text-sm">
                                                <Phone className="h-4 w-4 text-blue-600" />
                                                <span>{clinic.phone}</span>
                                            </div>
                                        )}

                                        {/* Website */}
                                        {clinic.website && (
                                            <div className="flex items-center gap-2 mb-3 text-gray-600 text-sm">
                                                <Globe className="h-4 w-4 text-blue-600" />
                                                <a
                                                    href={clinic.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-blue-600 truncate"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {clinic.website}
                                                </a>
                                            </div>
                                        )}

                                        {/* Specialties */}
                                        {clinic.specialties && clinic.specialties.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {clinic.specialties.slice(0, 3).map((specialty) => (
                                                    <Badge
                                                        key={specialty._id || specialty.id}
                                                        variant="primary"
                                                        size="sm"
                                                    >
                                                        {specialty.name}
                                                    </Badge>
                                                ))}
                                                {clinic.specialties.length > 3 && (
                                                    <Badge variant="secondary" size="sm">
                                                        +{clinic.specialties.length - 3} khác
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Trước
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 rounded-lg border ${currentPage === page
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
