import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Clock, FileText, Edit2, Building2, Loader2, AlertCircle } from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { toast } from "react-toastify";

const ClinicList = () => {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                setLoading(true);
                const res = await adminclinicAPI.getAllClinics();
                if (res.data?.ok) {
                    setClinics(res.data.data || []);
                } else {
                    toast.error(res.data?.message || "Không thể tải danh sách phòng khám.");
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách phòng khám:", error);
                toast.error("Không thể tải danh sách phòng khám.");
            } finally {
                setLoading(false);
            }
        };
        fetchClinics();
    }, []);

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
            ACTIVE: { label: "Hoạt động", color: "bg-green-100 text-green-800 border-green-300" },
            INACTIVE: { label: "Ngừng hoạt động", color: "bg-gray-100 text-gray-800 border-gray-300" },
            REJECTED: { label: "Bị từ chối", color: "bg-red-100 text-red-800 border-red-300" },
        };
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:5000/uploads/${url}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Danh sách phòng khám
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Quản lý các cơ sở phòng khám của bạn
                    </p>
                </div>

                <button
                    onClick={() => navigate("/admin-clinic/clinics")}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Tạo phòng khám mới
                </button>
            </div>

            {clinics.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Chưa có phòng khám nào
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Bắt đầu bằng cách tạo phòng khám đầu tiên của bạn
                    </p>
                    <button
                        onClick={() => navigate("/admin-clinic/clinics")}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Tạo phòng khám mới
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinics.map((clinic) => {
                        const logoUrl = getImageUrl(clinic.logo_url);
                        const bannerUrl = getImageUrl(clinic.banner_url);
                        
                        return (
                            <div
                                key={clinic._id}
                                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Banner */}
                                {bannerUrl && (
                                    <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden">
                                        <img
                                            src={bannerUrl}
                                            alt="Banner"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                {!bannerUrl && (
                                    <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                                )}

                                {/* Header */}
                                <div className={`p-4 ${bannerUrl ? 'bg-white' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1">
                                            {logoUrl && (
                                                <img
                                                    src={logoUrl}
                                                    alt="Logo"
                                                    className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-lg font-bold ${bannerUrl ? 'text-gray-900' : 'text-white'} truncate`}>
                                                    {clinic.name}
                                                </h3>
                                                <div className="mt-1">
                                                    {getStatusBadge(clinic.status)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/admin-clinic/clinic/edit/${clinic._id}`)}
                                            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={18} className="text-blue-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    {/* Address */}
                                    {clinic.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin
                                                size={16}
                                                className="text-blue-600 flex-shrink-0 mt-0.5"
                                            />
                                            <div className="text-sm flex-1">
                                                {clinic.address.houseNumber && clinic.address.street && (
                                                    <p className="text-gray-900 font-semibold">
                                                        {clinic.address.houseNumber} {clinic.address.street}
                                                    </p>
                                                )}
                                                {clinic.address.alley && (
                                                    <p className="text-gray-600 text-xs">
                                                        {clinic.address.alley}
                                                    </p>
                                                )}
                                                {(clinic.address.ward?.name || clinic.address.province?.name) && (
                                                    <p className="text-gray-600 text-xs mt-1">
                                                        {clinic.address.ward?.name && `${clinic.address.ward.name}, `}
                                                        {clinic.address.province?.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Operating Hours */}
                                    <div className="flex items-start gap-2">
                                        <Clock
                                            size={16}
                                            className="text-blue-600 flex-shrink-0 mt-0.5"
                                        />
                                        <div className="text-sm">
                                            <p className="text-gray-900 font-semibold">
                                                {clinic.opening_hours} - {clinic.closing_hours}
                                            </p>
                                            <p className="text-gray-600 text-xs">Giờ hoạt động</p>
                                        </div>
                                    </div>

                                    {/* Registration Number */}
                                    {clinic.registration_number && (
                                        <div className="flex items-start gap-2">
                                            <FileText
                                                size={16}
                                                className="text-blue-600 flex-shrink-0 mt-0.5"
                                            />
                                            <div className="text-sm">
                                                <p className="text-gray-900 font-semibold">
                                                    {clinic.registration_number}
                                                </p>
                                                <p className="text-gray-600 text-xs">Số đăng ký</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Specialties */}
                                    {clinic.specialties && clinic.specialties.length > 0 && (
                                        <div className="pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 mb-2">Chuyên khoa:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {clinic.specialties.slice(0, 3).map((specialty, index) => (
                                                    <span
                                                        key={specialty._id || index}
                                                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                                    >
                                                        {specialty.name || specialty}
                                                    </span>
                                                ))}
                                                {clinic.specialties.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                                        +{clinic.specialties.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Info */}
                                    <div className="pt-2 border-t border-gray-200">
                                        {clinic.email && (
                                            <p className="text-xs text-gray-600 mb-1">
                                                <span className="font-semibold">Email:</span> {clinic.email}
                                            </p>
                                        )}
                                        {clinic.phone && (
                                            <p className="text-xs text-gray-600">
                                                <span className="font-semibold">Điện thoại:</span> {clinic.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-3">
                                        <button
                                            onClick={() => navigate(`/admin-clinic/clinic/edit/${clinic._id}`)}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit2 size={16} />
                                            Chỉnh sửa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default memo(ClinicList);

