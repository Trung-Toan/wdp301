import { memo, useState, useEffect } from "react";
import { Plus, X, MapPin, Clock, FileText, Image as ImageIcon } from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/file";

const ClinicCreation = () => {
    const [showModal, setShowModal] = useState(false);
    const [clinics, setClinics] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(true);
    const [filteredSpecialties, setFilteredSpecialties] = useState([]);
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [bannerPreview, setBannerPreview] = useState("");
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        website: "",
        logo_url: "",
        banner_url: "",
        description: "",
        registration_number: "",
        opening_hours: "08:00",
        closing_hours: "20:00",
        address: {
            province: { code: "79", name: "TP. Hồ Chí Minh" },
            ward: { code: "00001", name: "Phường Bến Nghé" },
            houseNumber: "",
            street: "",
            alley: "",
        },
        specialties: [],
    });

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                setLoadingSpecialties(true);
                const res = await adminclinicAPI.getAllSpecialties();
                if (res.data.ok) {
                    setSpecialties(res.data.data);
                    setFilteredSpecialties(res.data.data);
                } else {
                    console.error(
                        "Không thể lấy danh sách chuyên khoa:",
                        res.data.message
                    );
                    toast.error("Không thể lấy danh sách chuyên khoa.");
                }
            } catch (error) {
                console.error("Lỗi khi gọi API chuyên khoa:", error);
                toast.error("Lỗi khi lấy danh sách chuyên khoa. Vui lòng thử lại.");
            } finally {
                setLoadingSpecialties(false);
            }
        };
        fetchSpecialties();
    }, []);

    const handleAddClinic = () => {
        setShowModal(true);
        setFormData({
            name: "",
            phone: "",
            email: "",
            website: "",
            description: "",
            logo_url: "",
            banner_url: "",
            registration_number: "",
            opening_hours: "08:00",
            closing_hours: "20:00",
            address: {
                province: { code: "79", name: "TP. Hồ Chí Minh" },
                ward: { code: "00001", name: "Phường Bến Nghé" },
                houseNumber: "",
                street: "",
                alley: "",
            },
            specialties: [],
        });
        setLogoFile(null);
        setBannerFile(null);
        setLogoPreview("");
        setBannerPreview("");
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh hợp lệ.");
            return;
        }

        setLogoFile(file);
        const localURL = URL.createObjectURL(file);
        setLogoPreview(localURL);
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh hợp lệ.");
            return;
        }

        setBannerFile(file);
        const localURL = URL.createObjectURL(file);
        setBannerPreview(localURL);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setUploadingFiles(true);

            // Upload logo nếu có
            let logoFileName = formData.logo_url;
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append("myFile", logoFile);

                const logoUploadResponse = await axios.post(
                    `${API_BASE_URL}/upload`,
                    logoFormData
                );

                if (logoUploadResponse.data.files && logoUploadResponse.data.files.length > 0) {
                    logoFileName = logoUploadResponse.data.files[0].fileName;
                } else {
                    toast.error("Server upload logo không trả về tên file.");
                    setUploadingFiles(false);
                    return;
                }
            }

            // Upload banner nếu có
            let bannerFileName = formData.banner_url;
            if (bannerFile) {
                const bannerFormData = new FormData();
                bannerFormData.append("myFile", bannerFile);

                const bannerUploadResponse = await axios.post(
                    `${API_BASE_URL}/upload`,
                    bannerFormData
                );

                if (bannerUploadResponse.data.files && bannerUploadResponse.data.files.length > 0) {
                    bannerFileName = bannerUploadResponse.data.files[0].fileName;
                } else {
                    toast.error("Server upload banner không trả về tên file.");
                    setUploadingFiles(false);
                    return;
                }
            }

            const payload = {
                clinic_info: {
                    ...formData,
                    logo_url: logoFileName,
                    banner_url: bannerFileName,
                },
            };

            // Gửi yêu cầu duyệt tạo phòng khám
            const res = await adminclinicAPI.createRegistrationRequest(payload);

            if (res.data.ok) {
                toast.success("Yêu cầu tạo phòng khám đã được gửi thành công!");
                setShowModal(false);
                setClinics([...clinics, res.data.data]);
            } else {
                toast.error(
                    "Không thể gửi yêu cầu tạo phòng khám: " + res.data.message
                );
            }
        } catch (error) {
            console.error(
                "Lỗi khi gửi yêu cầu tạo phòng khám:",
                error.response?.data?.message || error.message
            );
            toast.error(error.response?.data?.message || "Lỗi khi tạo phòng khám.");
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleSpecialtyChange = (specialtyId) => {
        setFormData((prev) => ({
            ...prev,
            specialties: prev.specialties.includes(specialtyId)
                ? prev.specialties.filter((id) => id !== specialtyId)
                : [...prev.specialties, specialtyId],
        }));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý phòng khám
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Tạo và quản lý các phòng khám của bạn
                    </p>
                </div>

                <button
                    onClick={handleAddClinic}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Tạo phòng khám
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clinics.map((clinic) => (
                    <div
                        key={clinic._id}
                        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                            <h3 className="text-lg font-bold">{clinic.name}</h3>
                            {/* Hiển thị trạng thái */}
                            {clinic.status === "PENDING" && (
                                <p className="text-sm text-yellow-200 mt-1 italic">
                                    Phòng khám đang chờ duyệt
                                </p>
                            )}
                            {clinic.status === "REJECTED" && (
                                <p className="text-sm text-red-200 mt-1 italic">
                                    Phòng khám bị từ chối
                                </p>
                            )}
                            {clinic.status === "APPROVED" && (
                                <p className="text-sm text-green-200 mt-1 italic">
                                    Phòng khám đã được duyệt
                                </p>
                            )}
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex items-start gap-2">
                                <MapPin
                                    size={16}
                                    className="text-blue-600 flex-shrink-0 mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="text-gray-900 font-semibold">
                                        {clinic.address?.houseNumber} {clinic.address?.street}
                                    </p>
                                    <p className="text-gray-600 text-xs mt-1">
                                        {clinic.address?.province?.name}
                                    </p>
                                </div>
                            </div>

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

                            <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-600">
                                    <span className="font-semibold">Email:</span> {clinic.email}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    <span className="font-semibold">Điện thoại:</span>{" "}
                                    {clinic.phone}
                                </p>
                            </div>

                            {/* Nếu PENDING thì không hiển thị nút */}
                            {clinic.status !== "PENDING" && (
                                <div className="flex gap-2 pt-3">
                                    <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded font-semibold text-sm hover:bg-blue-200 transition-colors">
                                        Chỉnh sửa
                                    </button>
                                    <button className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded font-semibold text-sm hover:bg-red-200 transition-colors">
                                        Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Tạo phòng khám mới
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Tên phòng khám *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tên phòng khám"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Số đăng ký *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.registration_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                registration_number: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập số đăng ký"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) =>
                                            setFormData({ ...formData, website: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập website"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập mô tả phòng khám"
                                        rows="3"
                                    />
                                </div>
                            </div>

                            {/* Logo and Banner Upload */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                    Hình ảnh phòng khám
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Logo phòng khám
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                                            {logoPreview ? (
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="w-32 h-32 object-contain rounded-lg mb-3"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLogoFile(null);
                                                            setLogoPreview("");
                                                        }}
                                                        className="text-sm text-red-600 hover:text-red-700"
                                                    >
                                                        Xóa ảnh
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center cursor-pointer">
                                                    <ImageIcon
                                                        size={48}
                                                        className="text-gray-400 mb-2"
                                                    />
                                                    <span className="text-sm text-gray-600">
                                                        Click để chọn logo
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Banner Upload */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Banner phòng khám
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                                            {bannerPreview ? (
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={bannerPreview}
                                                        alt="Banner preview"
                                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setBannerFile(null);
                                                            setBannerPreview("");
                                                        }}
                                                        className="text-sm text-red-600 hover:text-red-700"
                                                    >
                                                        Xóa ảnh
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center cursor-pointer">
                                                    <ImageIcon
                                                        size={48}
                                                        className="text-gray-400 mb-2"
                                                    />
                                                    <span className="text-sm text-gray-600">
                                                        Click để chọn banner
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleBannerChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                    Địa chỉ
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Số nhà
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.houseNumber}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    address: {
                                                        ...formData.address,
                                                        houseNumber: e.target.value,
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập số nhà"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Đường
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    address: {
                                                        ...formData.address,
                                                        street: e.target.value,
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập tên đường"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Hẻm
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.alley}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    address: {
                                                        ...formData.address,
                                                        alley: e.target.value,
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập hẻm (nếu có)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Operating Hours */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                    Giờ hoạt động
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Giờ mở cửa
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.opening_hours}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    opening_hours: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Giờ đóng cửa
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.closing_hours}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    closing_hours: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Chuyên khoa */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                    Chuyên khoa
                                </h3>

                                {loadingSpecialties ? (
                                    <p className="text-gray-500 text-sm">
                                        Đang tải chuyên khoa...
                                    </p>
                                ) : (
                                    <>
                                        {/* Ô tìm kiếm chuyên khoa */}
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm chuyên khoa..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={(e) => {
                                                    const keyword = e.target.value.toLowerCase();
                                                    setFilteredSpecialties(
                                                        specialties.filter((s) =>
                                                            s.name.toLowerCase().includes(keyword)
                                                        )
                                                    );
                                                }}
                                            />
                                        </div>

                                        {/* Danh sách rút gọn và có cuộn */}
                                        <div className="max-h-48 overflow-y-auto pr-1">
                                            {filteredSpecialties.length > 0 ? (
                                                filteredSpecialties.map((specialty) => (
                                                    <label
                                                        key={specialty._id}
                                                        className="flex items-center gap-2 py-1 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.specialties.includes(
                                                                specialty._id
                                                            )}
                                                            onChange={() =>
                                                                handleSpecialtyChange(specialty._id)
                                                            }
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-900">
                                                            {specialty.name}
                                                        </span>
                                                    </label>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">
                                                    Không tìm thấy chuyên khoa nào
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadingFiles}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {uploadingFiles ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Đang tải lên...
                                        </>
                                    ) : (
                                        "Tạo phòng khám"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(ClinicCreation);