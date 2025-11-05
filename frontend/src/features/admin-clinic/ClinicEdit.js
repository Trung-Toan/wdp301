import { memo, useState, useEffect } from "react";
import { X, MapPin, Clock, FileText, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { provinceApi } from "../../api/address/provinceApi";
import { wardApi } from "../../api/address/wardApi";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/file";

const ClinicEdit = () => {
    const [loading, setLoading] = useState(true);
    const [clinic, setClinic] = useState(null);
    const [specialties, setSpecialties] = useState([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(true);
    const [filteredSpecialties, setFilteredSpecialties] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
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
            province: "",
            ward: "",
            houseNumber: "",
            street: "",
            alley: "",
        },
        specialties: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Load clinic info
                const clinicRes = await adminclinicAPI.getClinicByAdmin();
                if (clinicRes.data.ok) {
                    const clinicData = clinicRes.data.data;
                    setClinic(clinicData);
                    
                    // Populate form data
                    setFormData({
                        name: clinicData.name || "",
                        phone: clinicData.phone || "",
                        email: clinicData.email || "",
                        website: clinicData.website || "",
                        logo_url: clinicData.logo_url || "",
                        banner_url: clinicData.banner_url || "",
                        description: clinicData.description || "",
                        registration_number: clinicData.registration_number || "",
                        opening_hours: clinicData.opening_hours || "08:00",
                        closing_hours: clinicData.closing_hours || "20:00",
                        address: {
                            province: clinicData.address?.province?.code || "",
                            ward: clinicData.address?.ward?.code || "",
                            houseNumber: clinicData.address?.houseNumber || "",
                            street: clinicData.address?.street || "",
                            alley: clinicData.address?.alley || "",
                        },
                        specialties: clinicData.specialties?.map(s => s._id || s) || [],
                    });
                    
                    // Set previews - convert fileName to full URL if needed
                    if (clinicData.logo_url) {
                        const logoUrl = clinicData.logo_url.startsWith('http') 
                            ? clinicData.logo_url 
                            : `http://localhost:5000/uploads/${clinicData.logo_url}`;
                        setLogoPreview(logoUrl);
                    }
                    if (clinicData.banner_url) {
                        const bannerUrl = clinicData.banner_url.startsWith('http') 
                            ? clinicData.banner_url 
                            : `http://localhost:5000/uploads/${clinicData.banner_url}`;
                        setBannerPreview(bannerUrl);
                    }
                    
                    // Load wards if province exists
                    if (clinicData.address?.province?.code) {
                        try {
                            const wardRes = await wardApi.getWardsByProvince(clinicData.address.province.code);
                            const rawWards = wardRes.data?.data || wardRes.data?.options || [];
                            const wardList = rawWards.map(w => ({
                                value: w.code || w.value,
                                label: w.name || w.label
                            }));
                            setWards(wardList);
                        } catch (err) {
                            console.error("Lỗi tải quận/huyện:", err);
                        }
                    }
                }
                
                // Load specialties
                setLoadingSpecialties(true);
                const specialtiesRes = await adminclinicAPI.getAllSpecialties();
                if (specialtiesRes.data.ok) {
                    const specialtiesList = specialtiesRes.data.data.map((s) => ({
                        id: s._id,
                        name: s.name,
                    }));
                    setSpecialties(specialtiesList);
                    setFilteredSpecialties(specialtiesList);
                }
                
                // Load provinces
                const provincesRes = await provinceApi.getProvinces();
                if (provincesRes.data?.options) {
                    const provinceList = provincesRes.data.options.map(p => ({
                        value: p.value,
                        label: p.label
                    }));
                    setProvinces(provinceList);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                toast.error("Không thể tải thông tin phòng khám.");
            } finally {
                setLoading(false);
                setLoadingSpecialties(false);
            }
        };
        
        fetchData();
    }, []);

    const isValidFileType = (file) => {
        const validTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/svg+xml",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];
        return validTypes.includes(file.type);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isValidFileType(file)) {
            toast.error("Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WEBP, BMP, SVG), PDF và tài liệu Office (DOC, DOCX, XLS, XLSX, PPT, PPTX).");
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("Kích thước file không được vượt quá 10MB.");
            return;
        }

        setLogoFile(file);
        
        if (file.type.startsWith("image/")) {
            const localURL = URL.createObjectURL(file);
            setLogoPreview(localURL);
        } else {
            setLogoPreview("");
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isValidFileType(file)) {
            toast.error("Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WEBP, BMP, SVG), PDF và tài liệu Office (DOC, DOCX, XLS, XLSX, PPT, PPTX).");
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("Kích thước file không được vượt quá 10MB.");
            return;
        }

        setBannerFile(file);
        
        if (file.type.startsWith("image/")) {
            const localURL = URL.createObjectURL(file);
            setBannerPreview(localURL);
        } else {
            setBannerPreview("");
        }
    };

    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.value;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, province: provinceCode, ward: "" }
        }));
        setWards([]);

        if (!provinceCode) return;

        try {
            const res = await wardApi.getWardsByProvince(provinceCode);
            const rawWards = res.data?.data || res.data?.options || [];
            const wardList = rawWards.map(w => ({
                value: w.code || w.value,
                label: w.name || w.label
            }));
            setWards(wardList);
        } catch (err) {
            console.error("Lỗi tải quận/huyện:", err);
            toast.error("Không thể tải danh sách quận/huyện.");
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.address.province) {
            toast.error("Vui lòng chọn Tỉnh/Thành phố");
            return;
        }
        if (!formData.address.ward) {
            toast.error("Vui lòng chọn Phường/Xã");
            return;
        }

        try {
            setUploadingFiles(true);

            const token =
                sessionStorage.getItem("access_token") ||
                sessionStorage.getItem("token") ||
                sessionStorage.getItem("accessToken");
            
            const cleanToken = token ? token.replace(/^"|"$/g, "") : null;

            let logoFileName = formData.logo_url;
            if (logoFile) {
                try {
                    const logoFormData = new FormData();
                    logoFormData.append("myFile", logoFile);

                    const logoUploadResponse = await axios.post(
                        `${API_BASE_URL}/upload`,
                        logoFormData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }),
                            },
                        }
                    );

                    if (logoUploadResponse.data.files && logoUploadResponse.data.files.length > 0) {
                        logoFileName = logoUploadResponse.data.files[0].fileName;
                    } else {
                        toast.error("Server upload logo không trả về tên file.");
                        setUploadingFiles(false);
                        return;
                    }
                } catch (uploadError) {
                    console.error("Lỗi upload logo:", uploadError);
                    toast.error("Lỗi khi upload logo. Vui lòng thử lại.");
                    setUploadingFiles(false);
                    return;
                }
            }

            let bannerFileName = formData.banner_url;
            if (bannerFile) {
                try {
                    const bannerFormData = new FormData();
                    bannerFormData.append("myFile", bannerFile);

                    const bannerUploadResponse = await axios.post(
                        `${API_BASE_URL}/upload`,
                        bannerFormData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }),
                            },
                        }
                    );

                    if (bannerUploadResponse.data.files && bannerUploadResponse.data.files.length > 0) {
                        bannerFileName = bannerUploadResponse.data.files[0].fileName;
                    } else {
                        toast.error("Server upload banner không trả về tên file.");
                        setUploadingFiles(false);
                        return;
                    }
                } catch (uploadError) {
                    console.error("Lỗi upload banner:", uploadError);
                    toast.error("Lỗi khi upload banner. Vui lòng thử lại.");
                    setUploadingFiles(false);
                    return;
                }
            }

            // Format address với province và ward từ code sang object
            const selectedProvince = provinces.find(p => p.value === formData.address.province);
            const selectedWard = wards.find(w => w.value === formData.address.ward);
            
            const formattedAddress = {
                ...formData.address,
                province: selectedProvince 
                    ? { code: selectedProvince.value, name: selectedProvince.label }
                    : null,
                ward: selectedWard 
                    ? { code: selectedWard.value, name: selectedWard.label }
                    : null,
            };

            const payload = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                website: formData.website,
                description: formData.description,
                registration_number: formData.registration_number,
                opening_hours: formData.opening_hours,
                closing_hours: formData.closing_hours,
                logo_url: logoFileName,
                banner_url: bannerFileName,
                address: formattedAddress,
                specialties: formData.specialties,
            };

            const res = await adminclinicAPI.updateClinic(payload);

            if (res.data.ok) {
                toast.success("Cập nhật thông tin phòng khám thành công!");
                // Reload clinic data
                const clinicRes = await adminclinicAPI.getClinicByAdmin();
                if (clinicRes.data.ok) {
                    setClinic(clinicRes.data.data);
                }
            } else {
                toast.error(res.data.message || "Không thể cập nhật thông tin phòng khám.");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật phòng khám:", error);
            let errorMessage = "Lỗi khi cập nhật phòng khám.";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = typeof error.response.data.error === 'string' 
                    ? error.response.data.error 
                    : error.response.data.error.message || error.response.data.error;
            }
            toast.error(errorMessage);
        } finally {
            setUploadingFiles(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!clinic) {
        return (
            <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-600">Không tìm thấy thông tin phòng khám.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin phòng khám</h2>
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

                    <div>
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
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mô tả
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập mô tả về phòng khám"
                    />
                </div>

                {/* Address */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Địa chỉ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Tỉnh/Thành phố *
                            </label>
                            <select
                                required
                                value={formData.address.province}
                                onChange={handleProvinceChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Chọn tỉnh/thành phố</option>
                                {provinces.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Phường/Xã *
                            </label>
                            <select
                                required
                                value={formData.address.ward}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, ward: e.target.value }
                                    }))
                                }
                                disabled={!wards.length}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Chọn phường/xã</option>
                                {wards.map(w => (
                                    <option key={w.value} value={w.value}>{w.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Số nhà
                            </label>
                            <input
                                type="text"
                                value={formData.address.houseNumber}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, houseNumber: e.target.value }
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Số nhà"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Đường/Phố
                            </label>
                            <input
                                type="text"
                                value={formData.address.street}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, street: e.target.value }
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tên đường/phố"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Ngõ/Hẻm
                            </label>
                            <input
                                type="text"
                                value={formData.address.alley}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, alley: e.target.value }
                                    }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ngõ/Hẻm"
                            />
                        </div>
                    </div>
                </div>

                {/* Operating Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Giờ mở cửa *
                        </label>
                        <input
                            type="time"
                            required
                            value={formData.opening_hours}
                            onChange={(e) =>
                                setFormData({ ...formData, opening_hours: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Giờ đóng cửa *
                        </label>
                        <input
                            type="time"
                            required
                            value={formData.closing_hours}
                            onChange={(e) =>
                                setFormData({ ...formData, closing_hours: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Specialties */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Chuyên khoa
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                        {filteredSpecialties.map((specialty) => (
                            <label
                                key={specialty.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.specialties.includes(specialty.id)}
                                    onChange={() => handleSpecialtyChange(specialty.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">{specialty.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Logo and Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                onChange={handleLogoChange}
                                className="hidden"
                                id="logo-upload"
                            />
                            <label
                                htmlFor="logo-upload"
                                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors text-sm font-semibold"
                            >
                                Chọn logo
                            </label>
                            {logoPreview && (
                                <div className="relative">
                                    {logoPreview.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                                        <div className="w-20 h-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                    ) : (
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-20 h-20 object-cover rounded border border-gray-300"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ELogo%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Banner
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                onChange={handleBannerChange}
                                className="hidden"
                                id="banner-upload"
                            />
                            <label
                                htmlFor="banner-upload"
                                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors text-sm font-semibold"
                            >
                                Chọn banner
                            </label>
                            {bannerPreview && (
                                <div className="relative">
                                    {bannerPreview.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                                        <div className="w-32 h-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                    ) : (
                                        <img
                                            src={bannerPreview}
                                            alt="Banner preview"
                                            className="w-32 h-20 object-cover rounded border border-gray-300"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="80"%3E%3Crect width="128" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EBanner%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={uploadingFiles}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadingFiles ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default memo(ClinicEdit);

