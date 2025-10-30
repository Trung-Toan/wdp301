import { memo, useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { doctorApi } from "../../api/doctor/doctorApi";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const navigate = useNavigate();

  // Lấy dữ liệu profile từ API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorApi.getProfile();
        const d = res.data.data; // dữ liệu BE trả về

        // Chuẩn hóa dữ liệu cho state
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
            avatar_url: d.user_id?.avatar_url || "",
          },
          account: {
            username: d.user_id?.account_id?.username || "",
            email: d.user_id?.account_id?.email || "",
            phone_number: d.user_id?.account_id?.phone_number || "",
          },
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Thay đổi text field
  const handleChange = (section, field, value) => {
    setDoctorProfile((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // Thay đổi ảnh avatar (chỉ FE)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localURL = URL.createObjectURL(file);
    setDoctorProfile((prev) => ({
      ...prev,
      user: { ...prev.user, avatar_url: localURL },
    }));
  };

  // Lưu thay đổi
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
      await doctorApi.updateProfile(payload);
      setIsEditing(false);
      toast.success("Cập nhật thành cong!");
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      toast.error("Không thể cập nhật hồ sơ: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Không thể tải dữ liệu hồ sơ bác sĩ.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-blue-700">Hồ sơ bác sĩ</h2>
          <div className="space-x-3">
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
            </Button>
            <Button
              onClick={() => navigate("/doctor/change-password")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={doctorProfile.user?.avatar_url || defaultAvatar}
            alt="Doctor Avatar"
            className="w-32 h-32 rounded-full border-4 border-blue-300 shadow-md object-cover"
          />
          {isEditing && (
            <div className="mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm text-gray-600"
              />
            </div>
          )}
        </div>

        {/* Thông tin tài khoản */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-1 mb-3">
            Thông tin tài khoản
          </h3>
          <div className="space-y-3">
            {["username", "email", "phone_number"].map((field) => (
              <div key={field}>
                <label className="block text-gray-600 font-medium mb-1 capitalize">
                  {field.replace("_", " ")}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={doctorProfile.account?.[field] || ""}
                    onChange={(e) =>
                      handleChange("account", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800">
                    {doctorProfile.account?.[field] || ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Thông tin cá nhân */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-1 mb-3">
            Thông tin cá nhân
          </h3>
          <div className="space-y-3">
            {[
              ["full_name", "Họ và tên"],
              ["dob", "Ngày sinh"],
              ["gender", "Giới tính"],
              ["address", "Địa chỉ"],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-gray-600 font-medium mb-1">
                  {label}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={doctorProfile.user?.[field] || ""}
                    onChange={(e) =>
                      handleChange("user", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800">{doctorProfile.user?.[field]}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Thông tin chuyên môn */}
        <section>
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-1 mb-3">
            Thông tin chuyên môn
          </h3>
          <div className="space-y-3">
            {[
              ["title", "Chức danh"],
              ["degree", "Bằng cấp"],
              ["experience", "Kinh nghiệm"],
              ["description", "Mô tả"],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-gray-600 font-medium mb-1">
                  {label}
                </label>
                {isEditing ? (
                  <textarea
                    rows={field === "description" ? 3 : 1}
                    value={doctorProfile.doctor?.[field] || ""}
                    onChange={(e) =>
                      handleChange("doctor", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800 whitespace-pre-line">
                    {doctorProfile.doctor?.[field]}
                  </p>
                )}
              </div>
            ))}

            {/* Danh sách chuyên khoa */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Chuyên khoa
              </label>
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
                  className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="text-gray-800">
                  {(doctorProfile.doctor?.specialties || []).join(", ")}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default memo(DoctorProfile);
