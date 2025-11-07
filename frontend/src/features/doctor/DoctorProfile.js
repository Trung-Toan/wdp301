import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  FileText,
  Edit2,
  Save,
  X,
  Upload,
  Building2,
  Award,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Camera,
} from "lucide-react";
import { doctorApi } from "../../api/doctor/doctorApi";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { toast } from "react-toastify";
import axios from "axios";
import { formatDateShort } from "../../utils/dateTimeUtils";
import { FaUserMd, FaLock, FaEdit, FaSave, FaIdCard, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaUpload } from "react-icons/fa"; // Thêm icon

const API_BASE_URL = "http://localhost:5000/api/file";
const FILE_SERVER_URL = "http://localhost:5000/uploads";

// Helper function để xử lý URL ảnh
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${FILE_SERVER_URL}/${url}`;
};

const StatusTag = ({ status }) => {
  let colorClass = "bg-gray-200 text-gray-800";
  let text = status;
  let Icon = FaExclamationTriangle;

  switch (status) {
    case "APPROVED":
      colorClass = "bg-green-100 text-green-700 border border-green-300";
      text = "Đã duyệt";
      Icon = FaCheckCircle;
      break;
    case "REJECTED":
      colorClass = "bg-red-100 text-red-700 border border-red-300";
      text = "Bị từ chối";
      Icon = FaTimesCircle;
      break;
    case "PENDING":
      colorClass = "bg-yellow-100 text-yellow-700 border border-yellow-300";
      text = "Đang chờ";
      Icon = FaClock;
      break;
    default:
      text = status;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}
    >
      <Icon className="mr-1.5 h-3 w-3" />
      {text}
    </span>
  );
};

// Component cho phần thông tin chi tiết (InfoRow)
const InfoRow = ({ label, value, isEditing, onChange, type = "text", rows = 1 }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      {isEditing ? (
        type === "textarea" ? (
          <textarea
            rows={rows}
            value={value || ""}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-none"
          />
        ) : (
          <input
            type={type}
            value={value || ""}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        )
      ) : (
        <p className="text-gray-900 font-semibold whitespace-pre-line min-h-[1.5rem]">{value || "Chưa cập nhật"}</p>
      )}
    </div>
  );
};

const DoctorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [newLicense, setNewLicense] = useState({
    licenseNumber: "",
    issued_by: "",
    issued_date: "",
    expiry_date: "",
    document_url: "",
    document_file: null,
  });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLicense((prev) => ({
        ...prev,
        document_file: file,
        document_url: file.name,
      }));
    }
  };

  const handleUploadLicense = async () => {
    if (!newLicense.document_file) {
      toast.error("Vui lòng chọn một tệp chứng chỉ.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("myFile", newLicense.document_file);

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/upload`,
        formData
      );

      let newLicenseName = null;
      if (uploadResponse.data.files && uploadResponse.data.files.length > 0) {
        newLicenseName = uploadResponse.data.files[0].fileName;
      } else {
        toast.error("Server upload không trả về tên file.");
        return;
      }

      const payload = {
        licenseNumber: newLicense.licenseNumber,
        issued_by: newLicense.issued_by,
        issued_date: newLicense.issued_date,
        expiry_date: newLicense.expiry_date,
        document_url: [newLicenseName],
      };
      await doctorApi.uploadLicense(payload);
      toast.success("Gửi chứng chỉ thành công!, vui lòng đợi duyệt");

      const res = await doctorApi.getMyLicense();
      setDoctorProfile((prev) => ({ ...prev, licenses: res.data.data }));

      setNewLicense({
        licenseNumber: "",
        issued_by: "",
        issued_date: "",
        expiry_date: "",
        document_url: "",
        document_file: null,
      });

      window.dispatchEvent(new CustomEvent("doctorProfileUpdated"));
    } catch (err) {
      console.error("Lỗi khi gửi chứng chỉ:", err);
      const uploadError = err.response?.data?.error || err.message;
      toast.error("Không thể gửi chứng chỉ: " + uploadError);
    }
  };

  useEffect(() => {
    const fetchProfileAndLicenses = async () => {
      try {
        const [profileRes, licenseRes] = await Promise.all([
          doctorApi.getProfile(),
          doctorApi.getMyLicense(),
        ]);

        const d = profileRes.data.data;
        const licenses = licenseRes.data.data || [];

        const avatarUrl = d.user_id?.avatar_url ? getImageUrl(d.user_id.avatar_url) : "";

        setDoctorProfile({
          doctor: {
            title: d.title,
            degree: d.degree,
            description: d.description,
            experience: d.experience,
            specialties: d.specialty_id?.map((s) => s.name) || [],
            clinic: d.clinic_id?.name || "",
          },
          user: {
            full_name: d.user_id?.full_name || "",
            dob: d.user_id?.dob?.split("T")[0] || "",
            gender: d.user_id?.gender || "",
            address: d.user_id?.address || "",
            avatar_url: avatarUrl,
          },
          account: {
            username: d.user_id?.account_id?.username || "",
            email: d.user_id?.account_id?.email || "",
            phone_number: d.user_id?.account_id?.phone_number || "",
          },
          licenses: licenses,
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndLicenses();
  }, []);

  const handleChange = (section, field, value) => {
    setDoctorProfile((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewAvatarFile(file);

    const localURL = URL.createObjectURL(file);
    setDoctorProfile((prev) => ({
      ...prev,
      user: { ...prev.user, avatar_url: localURL },
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: doctorProfile.doctor.title,
        degree: doctorProfile.doctor.degree,
        experience: doctorProfile.doctor.experience,
        description: doctorProfile.doctor.description,
        gender: doctorProfile.user.gender,
        dob: doctorProfile.user.dob,
        address: doctorProfile.user.address,
        username: doctorProfile.account.username,
        email: doctorProfile.account.email,
        phone_number: doctorProfile.account.phone_number,
      };

      let newAvatarName = null;

      if (newAvatarFile) {
        const formData = new FormData();
        formData.append("myFile", newAvatarFile);

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/upload`,
          formData
        );

        if (uploadResponse.data.files && uploadResponse.data.files.length > 0) {
          newAvatarName = uploadResponse.data.files[0].fileName;
        } else {
          toast.error("Server upload không trả về tên file.");
          return;
        }

        payload.avatar_url = newAvatarName;
      }

      await doctorApi.updateProfile(payload);
      setIsEditing(false);
      toast.success("Cập nhật thành công!");

      if (newAvatarFile && newAvatarName) {
        setDoctorProfile((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            avatar_url: `${FILE_SERVER_URL}/${newAvatarName}`,
          },
        }));
      }
      setNewAvatarFile(null);

      window.dispatchEvent(new CustomEvent("doctorProfileUpdated"));
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      const uploadError = err.response?.data?.error || err.message;
      toast.error("Không thể cập nhật hồ sơ: " + uploadError);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewAvatarFile(null);
    // Reload profile để reset về trạng thái ban đầu
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Không thể tải dữ liệu hồ sơ bác sĩ.</p>
        </div>
      </div>
    );
  }

  const licenses = doctorProfile.licenses || [];
  const hasPendingLicense = licenses.some((lic) => lic.status === "PENDING");
  const hasValidApprovedLicense = licenses.some((lic) => {
    if (lic.status !== "APPROVED") return false;
    if (!lic.expiry_date) return true;
    const expiry = new Date(lic.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry >= today;
  });
  const shouldShowUploadForm = !hasPendingLicense && !hasValidApprovedLicense;

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      case "PENDING":
        return "Chờ duyệt";
      default:
        return status;
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="relative">
                <img
                  src={
                    doctorProfile.user?.avatar_url
                      ? doctorProfile.user.avatar_url
                      : defaultAvatar
                  }
                  alt="Doctor Avatar"
                  className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-xl object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {doctorProfile.user?.full_name || "Bác sĩ"}
              </h1>
              {doctorProfile.doctor?.title && (
                <p className="text-lg text-blue-600 font-semibold mb-2">
                  {doctorProfile.doctor.title}
                </p>
              )}
              {doctorProfile.doctor?.degree && (
                <p className="text-gray-600 mb-4">{doctorProfile.doctor.degree}</p>
              )}
              {doctorProfile.doctor?.clinic && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                  <Building2 className="h-5 w-5" />
                  <span>{doctorProfile.doctor.clinic}</span>
                </div>
              )}
=======
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8 lg:p-10 border border-gray-100">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-blue-800 flex items-center mb-4 sm:mb-0">
            <FaUserMd className="mr-3 h-7 w-7 text-blue-500" />
            Hồ sơ Bác sĩ
          </h2>
          <div className="flex flex-wrap space-x-3">
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center px-4 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
                isEditing
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
              disabled={loading}
            >
              {isEditing ? <FaSave className="mr-2" /> : <FaEdit className="mr-2" />}
              {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
            </Button>
            <Button
              onClick={() => navigate("/doctor/change-password")}
              className="flex items-center px-4 py-2 font-semibold rounded-lg shadow-md bg-gray-500 hover:bg-gray-600 text-white transition duration-300"
            >
              <FaLock className="mr-2" />
              Đổi mật khẩu
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột trái: Avatar & Account Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Avatar */}
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-inner">
              <img
                src={
                  doctorProfile.user?.avatar_url
                    ? doctorProfile.user.avatar_url
                    : defaultAvatar
                }
                alt="Doctor Avatar"
                className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover ring-4 ring-blue-300"
              />
              {isEditing && (
                <div className="mt-4 w-full">
                  <label htmlFor="avatar-upload" className="block text-center cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 text-sm">
                    Thay đổi ảnh đại diện
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              )}
              <h3 className="mt-4 text-xl font-bold text-gray-800 text-center">
                {doctorProfile.user?.full_name || "Chưa cập nhật tên"}
              </h3>
            </div>
            
            {/* Thông tin tài khoản */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
                <FaLock className="mr-2 h-5 w-5" /> Thông tin tài khoản
              </h3>
              <div className="space-y-4">
                <InfoRow
                  label="Tên đăng nhập"
                  value={doctorProfile.account?.username}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("account", "username", e.target.value)}
                />
                <InfoRow
                  label="Email"
                  value={doctorProfile.account?.email}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("account", "email", e.target.value)}
                  type="email"
                />
                <InfoRow
                  label="Số điện thoại"
                  value={doctorProfile.account?.phone_number}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("account", "phone_number", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Personal & Professional Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Thông tin cá nhân */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
                <FaUserMd className="mr-2 h-5 w-5" /> Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Ngày sinh"
                  value={doctorProfile.user?.dob}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("user", "dob", e.target.value)}
                  type="date"
                />
                <InfoRow
                  label="Giới tính"
                  value={doctorProfile.user?.gender}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("user", "gender", e.target.value)}
                />
                <div className="md:col-span-2">
                  <InfoRow
                    label="Địa chỉ"
                    value={doctorProfile.user?.address}
                    isEditing={isEditing}
                    onChange={(e) => handleChange("user", "address", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Thông tin chuyên môn */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
                <FaIdCard className="mr-2 h-5 w-5" /> Thông tin chuyên môn
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                        label="Chức danh"
                        value={doctorProfile.doctor?.title}
                        isEditing={isEditing}
                        onChange={(e) => handleChange("doctor", "title", e.target.value)}
                    />
                    <InfoRow
                        label="Bằng cấp"
                        value={doctorProfile.doctor?.degree}
                        isEditing={isEditing}
                        onChange={(e) => handleChange("doctor", "degree", e.target.value)}
                    />
                    <div className="md:col-span-2">
                      <InfoRow
                          label="Chuyên khoa"
                          value={(doctorProfile.doctor?.specialties || []).join(", ")}
                          isEditing={isEditing}
                          onChange={(e) => handleChange("doctor", "specialties", e.target.value.split(",").map((s) => s.trim()))}
                      />
                    </div>
                </div>
                <InfoRow
                    label="Kinh nghiệm (năm)"
                    value={doctorProfile.doctor?.experience}
                    isEditing={isEditing}
                    onChange={(e) => handleChange("doctor", "experience", e.target.value)}
                    type="number"
                />
                <InfoRow
                    label="Mô tả"
                    value={doctorProfile.doctor?.description}
                    isEditing={isEditing}
                    onChange={(e) => handleChange("doctor", "description", e.target.value)}
                    type="textarea"
                    rows={3}
                />
              </div>
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                  >
                    <Save className="h-5 w-5" />
                    Lưu
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-md"
                  >
                    <X className="h-5 w-5" />
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <Edit2 className="h-5 w-5" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => navigate("/doctor/change-password")}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md"
                  >
                    <Lock className="h-5 w-5" />
                    Đổi mật khẩu
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin tài khoản */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Thông tin tài khoản</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Tên đăng nhập</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorProfile.account?.username || ""}
                        onChange={(e) => handleChange("account", "username", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{doctorProfile.account?.username || "-"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={doctorProfile.account?.email || ""}
                        onChange={(e) => handleChange("account", "email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{doctorProfile.account?.email || "-"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={doctorProfile.account?.phone_number || ""}
                        onChange={(e) => handleChange("account", "phone_number", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{doctorProfile.account?.phone_number || "-"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin cá nhân */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={doctorProfile.user?.full_name || ""}
                      onChange={(e) => handleChange("user", "full_name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{doctorProfile.user?.full_name || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ngày sinh</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={doctorProfile.user?.dob || ""}
                      onChange={(e) => handleChange("user", "dob", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {doctorProfile.user?.dob ? formatDateShort(doctorProfile.user.dob) : "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Giới tính</label>
                  {isEditing ? (
                    <select
                      value={doctorProfile.user?.gender || ""}
                      onChange={(e) => handleChange("user", "gender", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {doctorProfile.user?.gender === "MALE"
                        ? "Nam"
                        : doctorProfile.user?.gender === "FEMALE"
                        ? "Nữ"
                        : doctorProfile.user?.gender || "-"}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={doctorProfile.user?.address || ""}
                      onChange={(e) => handleChange("user", "address", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <p className="text-gray-900 font-medium">{doctorProfile.user?.address || "-"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin chuyên môn */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Thông tin chuyên môn</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Chức danh</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorProfile.doctor?.title || ""}
                        onChange={(e) => handleChange("doctor", "title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{doctorProfile.doctor?.title || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Bằng cấp</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorProfile.doctor?.degree || ""}
                        onChange={(e) => handleChange("doctor", "degree", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{doctorProfile.doctor?.degree || "-"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Kinh nghiệm</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={doctorProfile.doctor?.experience || ""}
                      onChange={(e) => handleChange("doctor", "experience", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-line">{doctorProfile.doctor?.experience || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mô tả</label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={doctorProfile.doctor?.description || ""}
                      onChange={(e) => handleChange("doctor", "description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-line">{doctorProfile.doctor?.description || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Chuyên khoa</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(doctorProfile.doctor?.specialties || []).join(", ")}
                      onChange={(e) =>
                        handleChange(
                          "doctor",
                          "specialties",
                          e.target.value.split(",").map((s) => s.trim())
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Nhập chuyên khoa, phân cách bằng dấu phẩy"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(doctorProfile.doctor?.specialties || []).map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                      {(!doctorProfile.doctor?.specialties || doctorProfile.doctor.specialties.length === 0) && (
                        <span className="text-gray-500">Chưa có chuyên khoa</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Licenses */}
          <div className="space-y-6">
            {/* Chứng chỉ hành nghề */}
<<<<<<< HEAD
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <Award className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Chứng chỉ hành nghề</h2>
              </div>

              {/* Danh sách chứng chỉ */}
              <div className="space-y-4 mb-6">
                {licenses.length > 0 ? (
                  licenses.map((lic, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(lic.status)}
                          <span className="font-semibold text-gray-900">{getStatusText(lic.status)}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Số hiệu:</span>{" "}
                          <span className="font-medium text-gray-900">{lic.licenseNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cơ quan cấp:</span>{" "}
                          <span className="font-medium text-gray-900">{lic.issued_by}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Ngày cấp:</span>{" "}
                          <span className="font-medium text-gray-900">
                            {formatDateShort(lic.issued_date)}
                          </span>
                        </div>
                        {lic.expiry_date && (
                          <div>
                            <span className="text-gray-600">Ngày hết hạn:</span>{" "}
                            <span className="font-medium text-gray-900">
                              {formatDateShort(lic.expiry_date)}
                            </span>
                          </div>
                        )}
                        {lic.document_url && (
                          <div>
                            <a
                              href={`${FILE_SERVER_URL}/${lic.document_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">Xem tài liệu</span>
                            </a>
                          </div>
                        )}
=======
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
                <FaIdCard className="mr-2 h-5 w-5" /> Chứng chỉ hành nghề
              </h3>
              
              {/* Danh sách chứng chỉ */}
              <div className="space-y-4 mb-6">
                {(doctorProfile.licenses || []).length > 0 ? (
                  doctorProfile.licenses.map((lic, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-blue-200 rounded-lg bg-blue-50 shadow-sm transition duration-300 hover:shadow-md"
                    >
                      <div className="flex justify-between items-center mb-2">
                          <p className="text-lg font-semibold text-blue-700">Số hiệu: {lic.licenseNumber}</p>
                          <StatusTag status={lic.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-700">
                          <div>
                            <p><strong>Cơ quan cấp:</strong> {lic.issued_by}</p>
                            <p><strong>Ngày cấp:</strong> {formatDateShort(lic.issued_date)}</p>
                          </div>
                          <div>
                            <p>
                                <strong>Ngày hết hạn:</strong>{" "}
                                {lic.expiry_date
                                  ? formatDateShort(lic.expiry_date)
                                  : <span className="text-gray-500">Không có</span>}
                            </p>
                            <p>
                                <strong>File đính kèm:</strong>{" "}
                                <a
                                  href={`${FILE_SERVER_URL}/${lic.document_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline transition duration-150"
                                >
                                  Tải về
                                </a>
                            </p>
                          </div>
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                      </div>
                    </div>
                  ))
                ) : (
<<<<<<< HEAD
                  <p className="text-gray-500 text-center py-4">Chưa có chứng chỉ nào được gửi.</p>
=======
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
                    <FaIdCard className="mx-auto h-8 w-8 mb-2" />
                    <p>Chưa có chứng chỉ nào được gửi.</p>
                  </div>
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                )}
              </div>

              {/* Form gửi chứng chỉ */}
              {shouldShowUploadForm && (
<<<<<<< HEAD
                <div className="p-5 border border-blue-200 rounded-xl bg-blue-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Gửi chứng chỉ mới
                  </h3>
=======
                <div className="p-6 border border-green-300 rounded-xl shadow-inner bg-green-50">
                  <h4 className="text-green-700 font-bold mb-4 flex items-center">
                    <FaUpload className="mr-2" /> Gửi chứng chỉ mới
                  </h4>
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await handleUploadLicense();
                    }}
                    className="space-y-4"
                  >
                    <div>
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số hiệu chứng chỉ *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
=======
                      <label className="block text-gray-600 font-medium mb-1">Số hiệu chứng chỉ</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                        value={newLicense.licenseNumber}
                        onChange={(e) => setNewLicense({ ...newLicense, licenseNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div>
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cơ quan cấp *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
=======
                      <label className="block text-gray-600 font-medium mb-1">Cơ quan cấp</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                        value={newLicense.issued_by}
                        onChange={(e) => setNewLicense({ ...newLicense, issued_by: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày cấp *
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
=======
                        <label className="block text-gray-600 font-medium mb-1">Ngày cấp</label>
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                          value={newLicense.issued_date}
                          onChange={(e) => setNewLicense({ ...newLicense, issued_date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày hết hạn
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
=======
                        <label className="block text-gray-600 font-medium mb-1">Ngày hết hạn (Nếu có)</label>
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500 outline-none"
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                          value={newLicense.expiry_date}
                          onChange={(e) => setNewLicense({ ...newLicense, expiry_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tệp chứng chỉ (PDF) *
                      </label>
=======
                      <label className="block text-gray-600 font-medium mb-1">Tệp chứng chỉ (PDF)</label>
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleFileChange(e)}
<<<<<<< HEAD
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
=======
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                        required
                      />
                    </div>

                    <button
                      type="submit"
<<<<<<< HEAD
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
=======
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-300"
>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
                    >
                      Gửi phê duyệt
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
<<<<<<< HEAD
=======

>>>>>>> 7c241f8a5960c784193aaf5d264fd08f1e1a8821
      </div>
    </div>
  );
};

export default memo(DoctorProfile);