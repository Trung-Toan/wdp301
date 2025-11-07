import { memo, useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ASSISTANT_API } from "../../api/assistant/assistant.api";
import defaultAvatar from "../../assets/images/default-avatar.png";
import {
  FaUserNurse,
  FaUserMd,
  FaEdit,
  FaSave,
  FaLock,
  FaClipboardList,
  FaClinicMedical,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:5000/api/file";
const FILE_SERVER_URL = "http://localhost:5000/uploads";

// Chuẩn hoá URL ảnh (tên file -> URL tuyệt đối)
const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${FILE_SERVER_URL}/${url}`;
};

// Hàng thông tin editable / readonly
const InfoRow = ({ label, value, isEditing, onChange, type = "text", rows = 3 }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      {isEditing ? (
        type === "textarea" ? (
          <textarea
            rows={rows}
            value={value ?? ""}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-none"
          />
        ) : (
          <input
            type={type}
            value={value ?? ""}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        )
      ) : (
        <p className="text-gray-900 font-semibold whitespace-pre-line min-h-[1.5rem]">
          {value ?? "Chưa cập nhật"}
        </p>
      )}
    </div>
  );
};

const RoleCheckbox = ({ label, value, checked, onChange }) => (
  <label className="inline-flex items-center space-x-2 mr-4 mb-2">
    <input
      type="checkbox"
      value={value}
      checked={!!checked}
      onChange={onChange}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <span className="text-sm text-gray-800">{label}</span>
  </label>
);

const AssistantProfile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const navigate = useNavigate();

  // Map dữ liệu theo response MỚI (doctor_id & clinic_id là object)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ASSISTANT_API.getProfile();
        const data = res?.data?.data;
        if (!data) throw new Error("Không có dữ liệu hồ sơ");

        // Chuẩn hoá type: có thể là "NURSE" (string) hoặc ["NURSE"] (array)
        const rawType = data.assistant?.type;
        const normType = Array.isArray(rawType) ? rawType : rawType ? [rawType] : [];

        // Doctor mapping
        const docObj = data.assistant?.doctor_id || {};
        const docUser = docObj.user_id || {};
        const doctor = {
          _id: docObj._id || "",
          title: docObj.title || "",
          degree: docObj.degree || "",
          experience: docObj.experience || "",
          full_name: docUser.full_name || "",
          avatar_url: getImageUrl(docUser.avatar_url || ""),
        };

        // Clinic mapping
        const clinicObj = data.assistant?.clinic_id || {};
        const addr = clinicObj.address || {};
        const clinicFullAddress =
          addr.fullAddress ||
          [
            addr.houseNumber,
            addr.street,
            addr.alley,
            addr?.ward?.name,
            addr?.province?.name,
          ]
            .filter(Boolean)
            .join(", ");
        const clinic = {
          _id: clinicObj._id || "",
          name: clinicObj.name || "",
          phone: clinicObj.phone || "",
          email: clinicObj.email || "",
          logo_url: getImageUrl(clinicObj.logo_url || ""),
          banner_url: getImageUrl(clinicObj.banner_url || ""),
          address: clinicFullAddress || "",
        };

        setProfile({
          // information
          user: {
            full_name: data.information?.full_name ?? "",
            dob: data.information?.dob ? String(data.information.dob).split("T")[0] : "",
            gender: data.information?.gender ?? "",
            address: data.information?.address ?? "",
            avatar_url: getImageUrl(data.information?.avatar_url || ""),
          },
          // account
          account: {
            username: data.account?.username ?? "",
            email: data.account?.email ?? "",
            phone_number: data.account?.phone_number ?? "",
            status: data.account?.status ?? "ACTIVE",
            role: data.account?.role ?? "ASSISTANT",
            email_verified: !!data.account?.email_verified,
          },
          // assistant
          assistant: {
            note: data.assistant?.note ?? "",
            type: normType,
            doctor,
            clinic,
          },
        });
      } catch (err) {
        toast.error(err?.message || "Không thể tải hồ sơ trợ lý");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (section, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewAvatarFile(file);
    const localURL = URL.createObjectURL(file);
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, avatar_url: localURL },
    }));
  };

  const toggleRole = (role) => {
    setProfile((prev) => {
      const set = new Set(prev.assistant.type || []);
      if (set.has(role)) set.delete(role);
      else set.add(role);
      return {
        ...prev,
        assistant: { ...prev.assistant, type: Array.from(set) },
      };
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        // Gửi lại ba khối dữ liệu theo API của bạn
        account: {
          username: profile.account.username,
          email: profile.account.email,
          phone_number: profile.account.phone_number,
        },
        information: {
          full_name: profile.user.full_name,
          dob: profile.user.dob || null,
          gender: profile.user.gender,
          address: profile.user.address,
          // avatar_url sẽ bổ sung sau khi upload (nếu có)
        },
        assistant: {
          note: profile.assistant.note,
          type:
            profile.assistant.type && profile.assistant.type.length > 0
              ? profile.assistant.type
              : ["NURSE"], // theo schema yêu cầu mảng
        },
      };

      // Upload avatar nếu có
      let newAvatarName = null;
      if (newAvatarFile) {
        const formData = new FormData();
        formData.append("myFile", newAvatarFile);
        const uploadResponse = await axios.post(`${API_BASE_URL}/upload`, formData);
        if (uploadResponse?.data?.files?.length) {
          newAvatarName = uploadResponse.data.files[0].fileName;
          payload.information.avatar_url = newAvatarName;
        } else {
          toast.error("Server upload không trả về tên file.");
          return;
        }
      }

      await ASSISTANT_API.updateProfile(payload);
      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);

      if (newAvatarName) {
        setProfile((prev) => ({
          ...prev,
          user: { ...prev.user, avatar_url: `${FILE_SERVER_URL}/${newAvatarName}` },
        }));
      }
      setNewAvatarFile(null);

      window.dispatchEvent(new CustomEvent("assistantProfileUpdated"));
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Lỗi không xác định";
      toast.error("Không thể cập nhật hồ sơ: " + msg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Không thể tải dữ liệu hồ sơ trợ lý.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-8 lg:p-10 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-blue-800 flex items-center mb-4 sm:mb-0">
            <FaUserNurse className="mr-3 h-7 w-7 text-blue-500" />
            Hồ sơ Trợ lý
          </h2>
          <div className="flex flex-wrap space-x-3">
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center px-4 py-2 font-semibold rounded-lg shadow-md transition duration-300 ${
                isEditing ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {isEditing ? <FaSave className="mr-2" /> : <FaEdit className="mr-2" />}
              {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
            </Button>
            <Button
              onClick={() => navigate("/assistant/change-password")}
              className="flex items-center px-4 py-2 font-semibold rounded-lg shadow-md bg-gray-500 hover:bg-gray-600 text-white transition duration-300"
            >
              <FaLock className="mr-2" />
              Đổi mật khẩu
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Cột trái: Avatar & Tài khoản */}
          <div className="xl:col-span-1 space-y-8">
            {/* Avatar */}
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-inner">
              <img
                src={profile.user?.avatar_url || defaultAvatar}
                alt="Assistant Avatar"
                className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover ring-4 ring-blue-300"
              />
              {isEditing && (
                <div className="mt-4 w-full">
                  <label
                    htmlFor="avatar-upload"
                    className="block text-center cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 text-sm"
                  >
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
                {profile.user?.full_name || "Chưa cập nhật tên"}
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
                  value={profile.account?.username}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("account", "username", e.target.value)}
                />
                <InfoRow
                  label="Email"
                  value={profile.account?.email}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("account", "email", e.target.value)}
                  type="email"
                />
                <InfoRow
                  label="Số điện thoại"
                  value={profile.account?.phone_number}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("account", "phone_number", e.target.value)}
                />
              </div>
              {!isEditing && (
                <div className="mt-4 text-sm text-gray-500">
                  <div>
                    Trạng thái: <span className="font-semibold">{profile.account?.status}</span>
                  </div>
                  <div>
                    Vai trò: <span className="font-semibold">{profile.account?.role}</span>
                  </div>
                  <div>
                    Xác thực email:{" "}
                    <span className="font-semibold">
                      {profile.account?.email_verified ? "Đã xác thực" : "Chưa xác thực"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Thông tin cá nhân, Vai trò & Ghi chú, Phân công mới */}
          <div className="xl:col-span-2 space-y-8">
            {/* Thông tin cá nhân */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
                <FaUserNurse className="mr-2 h-5 w-5" /> Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Họ và tên"
                  value={profile.user?.full_name}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("user", "full_name", e.target.value)}
                />
                <InfoRow
                  label="Ngày sinh"
                  value={profile.user?.dob}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("user", "dob", e.target.value)}
                  type="date"
                />
                <InfoRow
                  label="Giới tính"
                  value={profile.user?.gender}
                  isEditing={isEditing}
                  onChange={(e) => handleChange("user", "gender", e.target.value)}
                />
                <div className="md:col-span-2">
                  <InfoRow
                    label="Địa chỉ"
                    value={profile.user?.address}
                    isEditing={isEditing}
                    onChange={(e) => handleChange("user", "address", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Vai trò & Ghi chú */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
                <FaClipboardList className="mr-2 h-5 w-5" /> Vai trò & ghi chú
              </h3>

              {/* Vai trò */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-500 block mb-2">Vai trò</label>
                {isEditing ? (
                  <div className="flex flex-wrap">
                    <RoleCheckbox
                      label="Điều dưỡng (NURSE)"
                      value="NURSE"
                      checked={profile.assistant.type?.includes("NURSE")}
                      onChange={() => toggleRole("NURSE")}
                    />
                    <RoleCheckbox
                      label="Lễ tân (RECEPTIONIST)"
                      value="RECEPTIONIST"
                      checked={profile.assistant.type?.includes("RECEPTIONIST")}
                      onChange={() => toggleRole("RECEPTIONIST")}
                    />
                  </div>
                ) : (
                  <p className="text-gray-900 font-semibold">
                    {profile.assistant.type?.length
                      ? profile.assistant.type.join(", ")
                      : "Chưa gán vai trò"}
                  </p>
                )}
              </div>

              {/* Ghi chú */}
              <InfoRow
                label="Ghi chú"
                value={profile.assistant?.note}
                isEditing={isEditing}
                onChange={(e) => handleChange("assistant", "note", e.target.value)}
                type="textarea"
                rows={3}
              />
            </div>

            {/* Phân công: hiển thị chi tiết doctor & clinic (từ object) */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center">
                <FaClinicMedical className="mr-2 h-5 w-5" />
                Phân công
              </h3>

              {/* Bác sĩ phụ trách */}
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 mb-6">
                <div className="flex items-center mb-4">
                  <FaUserMd className="text-blue-600 mr-2" />
                  <h4 className="text-lg font-semibold text-blue-800">Bác sĩ phụ trách</h4>
                </div>

                {profile.assistant?.doctor?._id ? (
                  <div className="flex items-start gap-4">
                    <img
                      src={profile.assistant.doctor.avatar_url || defaultAvatar}
                      alt="Doctor Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                    />
                    <div className="flex-1">
                      <div className="text-gray-900 font-semibold">
                        {profile.assistant.doctor.full_name || "Chưa rõ tên"}
                      </div>
                      <div className="text-sm text-gray-700">
                        {[
                          profile.assistant.doctor.title,
                          profile.assistant.doctor.degree,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      {profile.assistant.doctor.experience && (
                        <div className="text-sm text-gray-700">
                          Kinh nghiệm: {profile.assistant.doctor.experience} năm
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Chưa được phân công bác sĩ.</p>
                )}
              </div>

              {/* Phòng khám */}
              <div className="p-4 border border-emerald-100 rounded-lg bg-emerald-50">
                <div className="flex items-center mb-4">
                  <FaClinicMedical className="text-emerald-600 mr-2" />
                  <h4 className="text-lg font-semibold text-emerald-800">Phòng khám</h4>
                </div>

                {profile.assistant?.clinic?._id ? (
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={profile.assistant.clinic.logo_url || defaultAvatar}
                      alt="Clinic Logo"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow"
                    />
                    <div className="flex-1">
                      <div className="text-gray-900 font-semibold">
                        {profile.assistant.clinic.name}
                      </div>
                      <div className="mt-1 text-sm text-gray-700 flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{profile.assistant.clinic.address || "Chưa cập nhật địa chỉ"}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-700 flex items-center">
                        <FaPhone className="mr-2" />
                        <span>{profile.assistant.clinic.phone || "—"}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-700 flex items-center">
                        <FaEnvelope className="mr-2" />
                        <span>{profile.assistant.clinic.email || "—"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Chưa được phân công phòng khám.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AssistantProfile);
