import { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { adminclinicAPI } from "../../../api/admin-clinic/adminclinicAPI";
import { provinceApi } from "../../../api/address/provinceApi";
import { wardApi } from "../../../api/address/wardApi";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/file";

export default function CreateClinicModal({ isOpen, onClose, onSuccess }) {
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
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
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formData.address.province) {
      setWards([]);
      return;
    }
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
    // Reset form
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
      address: {
        province: "",
        ward: "",
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

    try {
      // Load specialties
      setLoadingSpecialties(true);
      const specialtiesRes = await adminclinicAPI.getAllSpecialties();
      if (specialtiesRes.data.ok) {
        setSpecialties(specialtiesRes.data.data);
        setFilteredSpecialties(specialtiesRes.data.data);
      }

      // Load provinces
      const provincesRes = await provinceApi.getProvinces();
      const data = provincesRes.data?.options || [];
      setProvinces(data);
    } catch (error) {
      console.error("Lỗi khi load data:", error);
    } finally {
      setLoadingSpecialties(false);
    }
  };

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
    return validTypes.includes(file.type.toLowerCase());
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      toast.error("Chỉ hỗ trợ file ảnh, PDF và tài liệu Office.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 10MB.");
      return;
    }

    setLogoFile(file);
    if (file.type.startsWith("image/")) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview("");
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      toast.error("Chỉ hỗ trợ file ảnh, PDF và tài liệu Office.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 10MB.");
      return;
    }

    setBannerFile(file);
    if (file.type.startsWith("image/")) {
      setBannerPreview(URL.createObjectURL(file));
    } else {
      setBannerPreview("");
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

      // Upload logo
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
                "Content-Type": "multipart/form-data",
                ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }),
              },
            }
          );
          if (
            logoUploadResponse.data.files &&
            logoUploadResponse.data.files.length > 0
          ) {
            logoFileName = logoUploadResponse.data.files[0].fileName;
          }
        } catch (uploadError) {
          console.error("Lỗi upload logo:", uploadError);
          toast.error("Lỗi khi upload logo.");
          setUploadingFiles(false);
          return;
        }
      }

      // Upload banner
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
                "Content-Type": "multipart/form-data",
                ...(cleanToken && { Authorization: `Bearer ${cleanToken}` }),
              },
            }
          );
          if (
            bannerUploadResponse.data.files &&
            bannerUploadResponse.data.files.length > 0
          ) {
            bannerFileName = bannerUploadResponse.data.files[0].fileName;
          }
        } catch (uploadError) {
          console.error("Lỗi upload banner:", uploadError);
          toast.error("Lỗi khi upload banner.");
          setUploadingFiles(false);
          return;
        }
      }

      // Format address
      const selectedProvince = provinces.find(
        (p) => p.value === formData.address.province
      );
      const selectedWard = wards.find((w) => w.value === formData.address.ward);
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
        clinic_info: {
          ...formData,
          address: formattedAddress,
          logo_url: logoFileName,
          banner_url: bannerFileName,
        },
      };

      const res = await adminclinicAPI.createRegistrationRequest(payload);

      if (res.data.ok) {
        toast.success("Yêu cầu tạo phòng khám đã được gửi thành công!");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(
          "Không thể gửi yêu cầu tạo phòng khám: " + res.data.message
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu tạo phòng khám:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo phòng khám.");
    } finally {
      setUploadingFiles(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
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
            onClick={onClose}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://..."
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows="3"
                placeholder="Mô tả phòng khám"
              />
            </div>
          </div>

          {/* Logo và Banner */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Hình ảnh</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-sm"
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="mt-2 w-20 h-20 object-cover rounded border"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm mb-2">Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="w-full text-sm"
                />
                {bannerPreview && (
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    className="mt-2 w-full h-20 object-cover rounded border"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Địa chỉ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Tỉnh/Thành phố *</label>
                <select
                  required
                  value={formData.address.province}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: {
                        ...formData.address,
                        province: e.target.value,
                        ward: "",
                      },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Phường/Xã *</label>
                <select
                  required
                  value={formData.address.ward}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, ward: e.target.value },
                    })
                  }
                  disabled={!wards.length}
                  className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100"
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Số nhà</label>
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
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Đường</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Giờ hoạt động</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Giờ mở cửa</label>
                <input
                  type="time"
                  value={formData.opening_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, opening_hours: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Giờ đóng cửa</label>
                <input
                  type="time"
                  value={formData.closing_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, closing_hours: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Chuyên khoa</h3>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
              {filteredSpecialties.map((specialty) => (
                <label
                  key={specialty._id}
                  className="flex items-center gap-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty._id)}
                    onChange={() => handleSpecialtyChange(specialty._id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{specialty.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploadingFiles}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadingFiles ? "Đang tải..." : "Tạo phòng khám"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
