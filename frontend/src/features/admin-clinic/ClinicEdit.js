import { memo, useState, useEffect, useMemo, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Save, Loader2, ArrowLeft, Check, ChevronsUpDown, X as XIcon } from "lucide-react";
import { adminclinicAPI } from "../../api/admin-clinic/adminclinicAPI";
import { provinceApi } from "../../api/address/provinceApi";
import { wardApi } from "../../api/address/wardApi";
import { toast } from "react-toastify";
import axios from "axios";
import { Combobox, Transition } from "@headlessui/react";

const API_BASE_URL = "http://localhost:5000/api/file";

/** Single-select searchable Combobox */
function SingleCombobox({
    label, required, value, onChange, options,
    placeholder = "Chọn...", disabled,
}) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const selected = useMemo(
        () => options.find((o) => o.value === value) || null,
        [options, value]
    );

    const filtered = useMemo(() => {
        if (!query) return options;
        const q = query.toLowerCase(); // không trim -> giữ dấu cách
        return options.filter((o) =>
            (o.label + " " + (o.hint ?? "")).toLowerCase().includes(q)
        );
    }, [options, query]);

    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <Combobox
                value={selected}
                onChange={(opt) => { onChange(opt?.value ?? ""); setIsOpen(false); }}
                disabled={disabled}
            >
                <div
                    className="relative w-full"
                    onKeyDown={(e) => { if (e.key === "Escape") setIsOpen(false); }}
                    onBlur={(e) => {
                        // đóng khi blur ra ngoài
                        if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false);
                    }}
                >
                    <Combobox.Input
                        displayValue={(opt) => opt?.label ?? ""}
                        onChange={(e) => setQuery(e.target.value)}
                        className={[
                            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 pr-9",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400",
                            disabled ? "opacity-60 cursor-not-allowed" : "border-gray-300",
                        ].join(" ")}
                        placeholder={placeholder}
                    />
                    <Combobox.Button
                        type="button"
                        onClick={() => setIsOpen((v) => !v)}
                        className="absolute inset-y-0 right-2 flex items-center"
                    >
                        <ChevronsUpDown size={16} className="text-gray-400" />
                    </Combobox.Button>

                    {isOpen && (
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="opacity-0 -translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-75"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-1"
                        >
                            <Combobox.Options className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                {filtered.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-gray-500">Không tìm thấy</div>
                                ) : (
                                    filtered.map((opt) => (
                                        <Combobox.Option
                                            key={opt.value}
                                            value={opt}
                                            className={({ active }) =>
                                                [
                                                    "cursor-pointer select-none px-3 py-2 text-sm",
                                                    active ? "bg-blue-50 text-blue-800" : "text-gray-700",
                                                ].join(" ")
                                            }
                                        >
                                            {({ selected }) => (
                                                <div className="flex items-center gap-2">
                                                    <Check size={16} className={selected ? "opacity-100" : "opacity-0"} />
                                                    <span>{opt.label}</span>
                                                </div>
                                            )}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </Transition>
                    )}
                </div>
            </Combobox>
        </div>
    );
}
/** Multi-select Combobox (checkbox trong danh sách) */
function MultiCheckboxCombobox({
    label, values, onChange, options,
    placeholder = "Gõ để tìm chuyên khoa...", disabled, maxBadges = 4,
}) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const selectedOptions = useMemo(
        () => values.map((v) => options.find((o) => o.value === v)).filter(Boolean),
        [values, options]
    );

    const filtered = useMemo(() => {
        if (!query) return options;
        const q = query.toLowerCase(); // giữ dấu cách
        return options.filter((o) =>
            (o.label + " " + (o.hint ?? "")).toLowerCase().includes(q)
        );
    }, [options, query]);

    const toggle = (v) => {
        const set = new Set(values);
        set.has(v) ? set.delete(v) : set.add(v);
        onChange(Array.from(set));
    };

    const clearAll = () => onChange([]);
    const selectAllFiltered = () =>
        onChange(Array.from(new Set([...values, ...filtered.map((f) => f.value)])));

    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {label}
                </label>
            )}
            <Combobox value={selectedOptions} multiple onChange={() => { }} disabled={disabled}>
                <div
                    className="relative w-full"
                    onKeyDown={(e) => { if (e.key === "Escape") setIsOpen(false); }}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false);
                    }}
                >
                    {/* Field + badges */}
                    <div
                        className={[
                            "flex min-h-[44px] w-full flex-wrap items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-gray-900 shadow-sm pr-9",
                            "focus-within:ring-2 focus-within:ring-blue-500 hover:border-gray-400",
                            disabled ? "opacity-60 cursor-not-allowed" : "border-gray-300",
                        ].join(" ")}
                    >
                        {selectedOptions.slice(0, maxBadges).map((opt) => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                            >
                                {opt.label}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); toggle(opt.value); }}
                                    className="rounded p-0.5 hover:bg-blue-100"
                                    aria-label={`Bỏ chọn ${opt.label}`}
                                >
                                    <XIcon size={12} />
                                </button>
                            </span>
                        ))}
                        {selectedOptions.length > maxBadges && (
                            <span className="text-xs text-gray-500">
                                +{selectedOptions.length - maxBadges} đã chọn
                            </span>
                        )}

                        <Combobox.Input
                            className="flex-1 min-w-[140px] bg-transparent px-1 py-1.5 focus:outline-none text-sm"
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={selectedOptions.length === 0 ? placeholder : undefined}
                        />

                        <Combobox.Button
                            type="button"
                            onClick={() => setIsOpen((v) => !v)}
                            className="absolute inset-y-0 right-2 flex items-center"
                        >
                            <ChevronsUpDown size={16} className="text-gray-400" />
                        </Combobox.Button>
                    </div>

                    {isOpen && (
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="opacity-0 -translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-75"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-1"
                        >
                            <Combobox.Options className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                {/* Bulk actions */}
                                <div className="sticky top-0 bg-white/95 backdrop-blur px-2 py-1.5 text-[12px] text-gray-600 border-b flex items-center gap-2">
                                    <button type="button" className="px-2 py-0.5 rounded border hover:bg-gray-50" onClick={selectAllFiltered}>
                                        Chọn tất cả
                                    </button>
                                    <button type="button" className="px-2 py-0.5 rounded border hover:bg-gray-50" onClick={clearAll}>
                                        Bỏ chọn hết
                                    </button>
                                    <span className="ml-auto">{filtered.length} mục</span>
                                </div>

                                {filtered.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-gray-500">Không tìm thấy</div>
                                ) : (
                                    filtered.map((opt) => {
                                        const checked = values.includes(opt.value);
                                        return (
                                            <Combobox.Option
                                                key={opt.value}
                                                value={opt}
                                                onClick={(e) => { e.preventDefault(); toggle(opt.value); }}
                                                className={({ active }) =>
                                                    [
                                                        "cursor-pointer select-none px-3 py-2 text-sm",
                                                        active ? "bg-blue-50 text-blue-800" : "text-gray-700",
                                                    ].join(" ")
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" readOnly checked={checked} className="w-4 h-4" />
                                                    <span className="font-medium">{opt.label}</span>
                                                </div>
                                            </Combobox.Option>
                                        );
                                    })
                                )}
                            </Combobox.Options>
                        </Transition>
                    )}
                </div>
            </Combobox>
        </div>
    );
}


const ClinicEdit = () => {
    const { clinicId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clinic, setClinic] = useState(null);
    const [specialties, setSpecialties] = useState([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(true);
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
        address: { province: "", ward: "", houseNumber: "", street: "", alley: "" },
        specialties: [],
    });

    // options map (luôn gọi hook trên top-level)
    const specialtyOptions = useMemo(() => specialties.map((s) => ({ value: s.id || s._id, label: s.name })), [specialties]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let clinicData = null;
                if (clinicId) {
                    const clinicsRes = await adminclinicAPI.getAllClinics();
                    if (clinicsRes.data?.ok) {
                        clinicData = clinicsRes.data.data.find(c => c._id === clinicId);
                        if (!clinicData) {
                            toast.error("Không tìm thấy phòng khám.");
                            navigate("/admin-clinic/clinic/list");
                            return;
                        }
                    }
                } else {
                    const clinicRes = await adminclinicAPI.getClinicByAdmin();
                    if (clinicRes.data.ok) clinicData = clinicRes.data.data;
                }

                if (clinicData) {
                    setClinic(clinicData);
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

                    if (clinicData.logo_url) {
                        const logoUrl = clinicData.logo_url.startsWith('http') ? clinicData.logo_url : `http://localhost:5000/uploads/${clinicData.logo_url}`;
                        setLogoPreview(logoUrl);
                    }
                    if (clinicData.banner_url) {
                        const bannerUrl = clinicData.banner_url.startsWith('http') ? clinicData.banner_url : `http://localhost:5000/uploads/${clinicData.banner_url}`;
                        setBannerPreview(bannerUrl);
                    }

                    if (clinicData.address?.province?.code) {
                        try {
                            const wardRes = await wardApi.getWardsByProvince(clinicData.address.province.code);
                            const rawWards = wardRes.data?.data || wardRes.data?.options || [];
                            const wardList = rawWards.map(w => ({ value: w.code || w.value, label: w.name || w.label }));
                            setWards(wardList);
                        } catch (err) { console.error("Lỗi tải quận/huyện:", err); }
                    }
                }

                setLoadingSpecialties(true);
                const specialtiesRes = await adminclinicAPI.getAllSpecialties();
                if (specialtiesRes.data.ok) {
                    const specialtiesList = specialtiesRes.data.data.map((s) => ({ id: s._id, name: s.name }));
                    setSpecialties(specialtiesList);
                }

                const provincesRes = await provinceApi.getProvinces();
                if (provincesRes.data?.options) {
                    const provinceList = provincesRes.data.options.map(p => ({ value: p.value, label: p.label }));
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
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",];
        return validTypes.includes(file.type);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!isValidFileType(file)) { toast.error("Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WEBP, BMP, SVG), PDF và tài liệu Office (DOC, DOCX, XLS, XLSX, PPT, PPTX)."); return; }
        const maxSize = 10 * 1024 * 1024; if (file.size > maxSize) { toast.error("Kích thước file không được vượt quá 10MB."); return; }
        setLogoFile(file);
        setLogoPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    };

    const handleBannerChange = (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!isValidFileType(file)) { toast.error("Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WEBP, BMP, SVG), PDF và tài liệu Office (DOC, DOCX, XLS, XLSX, PPT, PPTX)."); return; }
        const maxSize = 10 * 1024 * 1024; if (file.size > maxSize) { toast.error("Kích thước file không được vượt quá 10MB."); return; }
        setBannerFile(file);
        setBannerPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    };

    // Khi chọn tỉnh trong Combobox
    const handleProvinceSelect = async (provinceCode) => {
        setFormData(prev => ({ ...prev, address: { ...prev.address, province: provinceCode, ward: "" } }));
        setWards([]);
        if (!provinceCode) return;
        try {
            const res = await wardApi.getWardsByProvince(provinceCode);
            const rawWards = res.data?.data || res.data?.options || [];
            const wardList = rawWards.map(w => ({ value: w.code || w.value, label: w.name || w.label }));
            setWards(wardList);
        } catch (err) {
            console.error("Lỗi tải quận/huyện:", err);
            toast.error("Không thể tải danh sách quận/huyện.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.address.province) { toast.error("Vui lòng chọn Tỉnh/Thành phố"); return; }
        if (!formData.address.ward) { toast.error("Vui lòng chọn Phường/Xã"); return; }

        try {
            setUploadingFiles(true);
            const token = sessionStorage.getItem("access_token") || sessionStorage.getItem("token") || sessionStorage.getItem("accessToken");
            const cleanToken = token ? token.replace(/^"|"$/g, "") : null;

            let logoFileName = formData.logo_url;
            if (logoFile) {
                try {
                    const logoFormData = new FormData(); logoFormData.append("myFile", logoFile);
                    const logoUploadResponse = await axios.post(`${API_BASE_URL}/upload`, logoFormData, { headers: { 'Content-Type': 'multipart/form-data', ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }), }, });
                    if (logoUploadResponse.data.files && logoUploadResponse.data.files.length > 0) { logoFileName = logoUploadResponse.data.files[0].fileName; } else { toast.error("Server upload logo không trả về tên file."); setUploadingFiles(false); return; }
                } catch (uploadError) { console.error("Lỗi upload logo:", uploadError); toast.error("Lỗi khi upload logo. Vui lòng thử lại."); setUploadingFiles(false); return; }
            }

            let bannerFileName = formData.banner_url;
            if (bannerFile) {
                try {
                    const bannerFormData = new FormData(); bannerFormData.append("myFile", bannerFile);
                    const bannerUploadResponse = await axios.post(`${API_BASE_URL}/upload`, bannerFormData, { headers: { 'Content-Type': 'multipart/form-data', ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }), }, });
                    if (bannerUploadResponse.data.files && bannerUploadResponse.data.files.length > 0) { bannerFileName = bannerUploadResponse.data.files[0].fileName; } else { toast.error("Server upload banner không trả về tên file."); setUploadingFiles(false); return; }
                } catch (uploadError) { console.error("Lỗi upload banner:", uploadError); toast.error("Lỗi khi upload banner. Vui lòng thử lại."); setUploadingFiles(false); return; }
            }

            const selectedProvince = provinces.find(p => p.value === formData.address.province);
            const selectedWard = wards.find(w => w.value === formData.address.ward);
            const formattedAddress = {
                ...formData.address,
                province: selectedProvince ? { code: selectedProvince.value, name: selectedProvince.label } : null,
                ward: selectedWard ? { code: selectedWard.value, name: selectedWard.label } : null,
            };

            const payload = {
                clinic_id: clinicId || clinic?._id,
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
                if (clinicId) {
                    const clinicsRes = await adminclinicAPI.getAllClinics();
                    if (clinicsRes.data?.ok) {
                        const updatedClinic = clinicsRes.data.data.find(c => c._id === clinicId);
                        if (updatedClinic) setClinic(updatedClinic);
                    }
                } else {
                    const clinicRes = await adminclinicAPI.getClinicByAdmin();
                    if (clinicRes.data.ok) setClinic(clinicRes.data.data);
                }
            } else {
                toast.error(res.data.message || "Không thể cập nhật thông tin phòng khám.");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật phòng khám:", error);
            let errorMessage = "Lỗi khi cập nhật phòng khám.";
            if (error.response?.data?.message) errorMessage = error.response.data.message;
            else if (error.response?.data?.error) errorMessage = typeof error.response.data.error === 'string' ? error.response.data.error : error.response.data.error.message || error.response.data.error;
            toast.error(errorMessage);
        } finally { setUploadingFiles(false); }
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
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/admin-clinic/clinic/list")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Quay lại danh sách">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin phòng khám</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Tên phòng khám *</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập tên phòng khám" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Số đăng ký *</label>
                        <input type="text" required value={formData.registration_number} onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập số đăng ký" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập email" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Điện thoại</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập số điện thoại" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                        <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Mô tả</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập mô tả về phòng khám" />
                </div>

                {/* Address */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Địa chỉ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SingleCombobox
                                label="Tỉnh/Thành phố *"
                                required
                                value={formData.address.province}
                                onChange={handleProvinceSelect}
                                options={provinces}
                                placeholder="Chọn tỉnh/thành phố"
                            />
                        </div>
                        <div>
                            <SingleCombobox
                                label="Phường/Xã *"
                                required
                                value={formData.address.ward}
                                onChange={(v) => setFormData(prev => ({ ...prev, address: { ...prev.address, ward: v } }))}
                                options={wards}
                                disabled={!wards.length}
                                placeholder={wards.length ? "Chọn phường/xã" : "Chọn tỉnh trước"}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Số nhà</label>
                            <input type="text" value={formData.address.houseNumber} onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, houseNumber: e.target.value } }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Số nhà" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Đường/Phố</label>
                            <input type="text" value={formData.address.street} onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tên đường/phố" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Ngõ/Hẻm</label>
                            <input type="text" value={formData.address.alley} onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, alley: e.target.value } }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ngõ/Hẻm" />
                        </div>
                    </div>
                </div>

                {/* Specialties */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Chuyên khoa</label>
                    <MultiCheckboxCombobox
                        label="Chọn chuyên khoa"
                        values={formData.specialties}
                        onChange={(vals) => setFormData((s) => ({ ...s, specialties: vals }))}
                        options={specialtyOptions}
                        disabled={loadingSpecialties}
                        placeholder="Gõ để tìm, tick để chọn..."
                    />
                </div>

                {/* Logo and Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Logo</label>
                        <div className="flex items-center gap-4">
                            <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                            <label htmlFor="logo-upload" className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors text-sm font-semibold">Chọn logo</label>
                            {logoPreview && (
                                <div className="relative">
                                    {logoPreview.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                                        <div className="w-20 h-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                    ) : (
                                        <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-cover rounded border border-gray-300" onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ELogo%3C/text%3E%3C/svg%3E'; }} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Banner</label>
                        <div className="flex items-center gap-4">
                            <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleBannerChange} className="hidden" id="banner-upload" />
                            <label htmlFor="banner-upload" className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors text-sm font-semibold">Chọn banner</label>
                            {bannerPreview && (
                                <div className="relative">
                                    {bannerPreview.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                                        <div className="w-32 h-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                    ) : (
                                        <img src={bannerPreview} alt="Banner preview" className="w-32 h-20 object-cover rounded border border-gray-300" onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="80"%3E%3Crect width="128" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EBanner%3C/text%3E%3C/svg%3E'; }} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button type="submit" disabled={uploadingFiles} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploadingFiles ? (<><Loader2 className="h-5 w-5 animate-spin" />Đang lưu...</>) : (<><Save size={20} />Lưu thay đổi</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default memo(ClinicEdit);
