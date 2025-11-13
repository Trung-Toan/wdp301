import { useState, useEffect, useMemo, Fragment } from "react";

import { X, Check, ChevronsUpDown, X as XIcon } from "lucide-react";

import { adminclinicAPI } from "../../../api/admin-clinic/adminclinicAPI";
import { provinceApi } from "../../../api/address/provinceApi";
import { wardApi } from "../../../api/address/wardApi";
import { toast } from "react-toastify";
import axios from "axios";
import { Combobox, Transition } from "@headlessui/react";

const API_BASE_URL = "http://localhost:5000/api/file";

function classNames(...cls) { return cls.filter(Boolean).join(" "); }

/** Single-select searchable Combobox (không dùng Formik) */
function SingleCombobox({ label, required, value, onChange, options, placeholder = "Chọn...", disabled }) {
    const [query, setQuery] = useState("");
    const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value]);
    const filtered = useMemo(() => {
        if (!query) return options;
        const q = query.toLowerCase(); // không trim -> chấp nhận dấu cách
        return options.filter((o) => (o.label + " " + (o.hint ?? "")).toLowerCase().includes(q));
    }, [options, query]);

    return (
        <div>
            {label && (
                <label className="block text-sm mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <Combobox value={selected} onChange={(opt) => onChange(opt?.value ?? "")} disabled={disabled}>
                <div className="relative w-full">
                    <Combobox.Input
                        displayValue={(opt) => opt?.label ?? ""}
                        onChange={(e) => setQuery(e.target.value)}
                        className={classNames(
                            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 pr-9",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400",
                            disabled ? "opacity-60 cursor-not-allowed" : "border-gray-300"
                        )}
                        placeholder={placeholder}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                        <ChevronsUpDown size={16} className="text-gray-400" />
                    </Combobox.Button>

                    <Transition
                        show
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
                                            classNames(
                                                "cursor-pointer select-none px-3 py-2 text-sm",
                                                active ? "bg-blue-50 text-blue-800" : "text-gray-700"
                                            )
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
                </div>
            </Combobox>
        </div>
    );
}

/** Multi-select Combobox hiển thị checkbox trong danh sách */
function MultiCheckboxCombobox({ label, required, values, onChange, options, placeholder = "Gõ để tìm chuyên khoa...", disabled, maxBadges = 4 }) {
    const [query, setQuery] = useState("");
    const selectedOptions = useMemo(() => values.map((v) => options.find((o) => o.value === v)).filter(Boolean), [values, options]);
    const filtered = useMemo(() => {
        if (!query) return options;
        const q = query.toLowerCase(); // không trim -> chấp nhận dấu cách
        return options.filter((o) => (o.label + " " + (o.hint ?? "")).toLowerCase().includes(q));
    }, [options, query]);

    const toggle = (v) => {
        const set = new Set(values);
        set.has(v) ? set.delete(v) : set.add(v);
        onChange(Array.from(set));
    };

    const clearAll = () => onChange([]);
    const selectAllFiltered = () => onChange(Array.from(new Set([...values, ...filtered.map((f) => f.value)])));

    return (
        <div>
            {label && (
                <label className="block text-sm mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <Combobox value={selectedOptions} multiple onChange={() => { }} disabled={disabled}>
                <div className="relative w-full">
                    {/* input + badges container */}
                    <div
                        className={classNames(
                            "flex min-h-[44px] w-full flex-wrap items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-gray-900 shadow-sm pr-9",
                            "focus-within:ring-2 focus-within:ring-blue-500 hover:border-gray-400",
                            disabled ? "opacity-60 cursor-not-allowed" : "border-gray-300"
                        )}
                    >
                        {selectedOptions.slice(0, maxBadges).map((opt) => (
                            <span key={opt.value} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                {opt.label}
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggle(opt.value); }} className="rounded p-0.5 hover:bg-blue-100" aria-label={`Bỏ chọn ${opt.label}`}>
                                    <XIcon size={12} />
                                </button>
                            </span>
                        ))}
                        {selectedOptions.length > maxBadges && (
                            <span className="text-xs text-gray-500">+{selectedOptions.length - maxBadges} đã chọn</span>
                        )}

                        <Combobox.Input
                            className="flex-1 min-w-[140px] bg-transparent px-1 py-1.5 focus:outline-none text-sm"
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={selectedOptions.length === 0 ? placeholder : undefined}
                        />

                        <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                            <ChevronsUpDown size={16} className="text-gray-400" />
                        </Combobox.Button>
                    </div>

                    <Transition
                        show
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 -translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 -translate-y-1"
                    >
                        <Combobox.Options className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            {/* bulk actions */}
                            <div className="sticky top-0 bg-white/95 backdrop-blur px-2 py-1.5 text-[12px] text-gray-600 border-b flex items-center gap-2">
                                <button type="button" className="px-2 py-0.5 rounded border hover:bg-gray-50" onClick={selectAllFiltered}>Chọn tất cả</button>
                                <button type="button" className="px-2 py-0.5 rounded border hover:bg-gray-50" onClick={clearAll}>Bỏ chọn hết</button>
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
                                                classNames(
                                                    "cursor-pointer select-none px-3 py-2 text-sm",
                                                    active ? "bg-blue-50 text-blue-800" : "text-gray-700"
                                                )
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
                </div>
            </Combobox>
        </div>
    );
}

export default function CreateClinicModal({ isOpen, onClose, onSuccess }) {
    const [specialties, setSpecialties] = useState([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(false);
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

    useEffect(() => { if (isOpen) { loadInitialData(); } }, [isOpen]);

    useEffect(() => {
        if (!formData.address.province) { setWards([]); return; }
        async function fetchWards() {
            try {
                const res = await wardApi.getWardsByProvince(formData.address.province);
                const data = res.data?.options || [];
                setWards(data);
            } catch (err) {
                console.error("Lỗi khi tải danh sách phường:", err);
                setWards([]);
            }
        }
        fetchWards();
    }, [formData.address.province]);

    const loadInitialData = async () => {
        setFormData({
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
        setLogoFile(null); setBannerFile(null); setLogoPreview(""); setBannerPreview("");

        try {
            setLoadingSpecialties(true);
            const specialtiesRes = await adminclinicAPI.getAllSpecialties();
            if (specialtiesRes.data.ok) setSpecialties(specialtiesRes.data.data);
            const provincesRes = await provinceApi.getProvinces();
            const data = provincesRes.data?.options || [];
            setProvinces(data);
        } catch (error) {
            console.error("Lỗi khi load data:", error);
        } finally { setLoadingSpecialties(false); }
    };

    const isValidFileType = (file) => {
        const validTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            "image/bmp", "image/svg+xml", "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];
        return validTypes.includes(file.type.toLowerCase());
    };
    // options cho combobox chuyên khoa / tỉnh / phường
    const specialtyOptions = useMemo(() => specialties.map((s) => ({ value: s._id, label: s.name })), [specialties]);
    const handleLogoChange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        if (!isValidFileType(file)) { toast.error("Chỉ hỗ trợ file ảnh, PDF và tài liệu Office."); return; }
        const maxSize = 10 * 1024 * 1024; if (file.size > maxSize) { toast.error("Kích thước file không được vượt quá 10MB."); return; }
        setLogoFile(file); setLogoPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        if (!isValidFileType(file)) { toast.error("Chỉ hỗ trợ file ảnh, PDF và tài liệu Office."); return; }
        const maxSize = 10 * 1024 * 1024; if (file.size > maxSize) { toast.error("Kích thước file không được vượt quá 10MB."); return; }
        setBannerFile(file); setBannerPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.address.province) { toast.error("Vui lòng chọn Tỉnh/Thành phố"); return; }
        if (!formData.address.ward) { toast.error("Vui lòng chọn Phường/Xã"); return; }

        try {
            setUploadingFiles(true);
            const token = sessionStorage.getItem("access_token") || sessionStorage.getItem("token") || sessionStorage.getItem("accessToken");
            const cleanToken = token ? token.replace(/^"|"$/g, "") : null;

            // Upload logo
            let logoFileName = formData.logo_url;
            if (logoFile) {
                try {
                    const logoFormData = new FormData(); logoFormData.append("myFile", logoFile);
                    const logoUploadResponse = await axios.post(`${API_BASE_URL}/upload`, logoFormData, { headers: { 'Content-Type': 'multipart/form-data', ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }), }, });
                    if (logoUploadResponse.data.files && logoUploadResponse.data.files.length > 0) { logoFileName = logoUploadResponse.data.files[0].fileName; }
                } catch (uploadError) { console.error("Lỗi upload logo:", uploadError); toast.error("Lỗi khi upload logo."); setUploadingFiles(false); return; }
            }

            // Upload banner
            let bannerFileName = formData.banner_url;
            if (bannerFile) {
                try {
                    const bannerFormData = new FormData(); bannerFormData.append("myFile", bannerFile);
                    const bannerUploadResponse = await axios.post(`${API_BASE_URL}/upload`, bannerFormData, { headers: { 'Content-Type': 'multipart/form-data', ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }), }, });
                    if (bannerUploadResponse.data.files && bannerUploadResponse.data.files.length > 0) { bannerFileName = bannerUploadResponse.data.files[0].fileName; }
                } catch (uploadError) { console.error("Lỗi upload banner:", uploadError); toast.error("Lỗi khi upload banner."); setUploadingFiles(false); return; }
            }

            // Format address
            const selectedProvince = provinces.find(p => p.value === formData.address.province);
            const selectedWard = wards.find(w => w.value === formData.address.ward);
            const formattedAddress = {
                ...formData.address,
                province: selectedProvince ? { code: selectedProvince.value, name: selectedProvince.label } : null,
                ward: selectedWard ? { code: selectedWard.value, name: selectedWard.label } : null,
            };

            const payload = { clinic_info: { ...formData, address: formattedAddress, logo_url: logoFileName, banner_url: bannerFileName } };
            const res = await adminclinicAPI.createRegistrationRequest(payload);
            if (res.data.ok) { toast.success("Yêu cầu tạo phòng khám đã được gửi thành công!"); onClose(); if (onSuccess) onSuccess(); }
            else { toast.error("Không thể gửi yêu cầu tạo phòng khám: " + res.data.message); }
        } catch (error) {
            console.error("Lỗi khi gửi yêu cầu tạo phòng khám:", error);
            toast.error(error.response?.data?.message || "Lỗi khi tạo phòng khám.");
        } finally { setUploadingFiles(false); }
    };

    if (!isOpen) return null;



    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Tạo phòng khám mới</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Tên phòng khám *</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nhập tên phòng khám" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Số đăng ký *</label>
                            <input type="text" required value={formData.registration_number} onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nhập số đăng ký" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nhập email" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Điện thoại</label>
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nhập số điện thoại" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                            <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Mô tả</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows="3" placeholder="Mô tả phòng khám" />
                        </div>
                    </div>

                    {/* Logo và Banner */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold mb-3">Hình ảnh</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-2">Logo</label>
                                <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm" />
                                {logoPreview && (<img src={logoPreview} alt="Logo" className="mt-2 w-20 h-20 object-cover rounded border" />)}
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Banner</label>
                                <input type="file" accept="image/*" onChange={handleBannerChange} className="w-full text-sm" />
                                {bannerPreview && (<img src={bannerPreview} alt="Banner" className="mt-2 w-full h-20 object-cover rounded border" />)}
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold mb-3">Địa chỉ</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <SingleCombobox
                                    label="Tỉnh/Thành phố"
                                    required
                                    value={formData.address.province}
                                    onChange={(v) => setFormData({ ...formData, address: { ...formData.address, province: v, ward: "" } })}
                                    options={provinces}
                                    placeholder="Chọn tỉnh/thành phố"
                                />
                            </div>
                            <div>
                                <SingleCombobox
                                    label="Phường/Xã"
                                    required
                                    value={formData.address.ward}
                                    onChange={(v) => setFormData({ ...formData, address: { ...formData.address, ward: v } })}
                                    options={wards}
                                    disabled={!wards.length}
                                    placeholder={wards.length ? "Chọn phường/xã" : "Chọn tỉnh trước"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Số nhà</label>
                                <input type="text" value={formData.address.houseNumber} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, houseNumber: e.target.value } })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Đường</label>
                                <input type="text" value={formData.address.street} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Specialties - Multi combobox with checkbox */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold mb-3">Chuyên khoa</h3>
                        <MultiCheckboxCombobox
                            label="Chọn chuyên khoa"
                            values={formData.specialties}
                            onChange={(vals) => setFormData((s) => ({ ...s, specialties: vals }))}
                            options={specialtyOptions}
                            disabled={loadingSpecialties}
                            placeholder="Gõ để tìm, tick để chọn..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Hủy</button>
                        <button type="submit" disabled={uploadingFiles} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                            {uploadingFiles ? "Đang tải..." : "Tạo phòng khám"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
