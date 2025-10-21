import { useState } from "react";
import { Button } from "react-bootstrap";
import { Navigate } from "react-router-dom";

const DoctorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState({
    doctor: {
      title: "Bác sĩ chuyên khoa II",
      degree: "Thạc sĩ - Bác sĩ",
      description: "Bác sĩ có hơn 10 năm kinh nghiệm trong lĩnh vực nội khoa.",
      experience: "10 năm công tác tại Bệnh viện Trung Ương Huế.",
      specialties: ["Nội tổng quát", "Tim mạch"],
    },
    user: {
      full_name: "Nguyễn Văn A",
      dob: "1980-03-15",
      gender: "Nam",
      address: "123 Nguyễn Trãi, Hà Nội",
      avatar_url: "https://via.placeholder.com/150",
    },
    account: {
      username: "dr.nguyenvana",
      email: "nguyenvana@example.com",
      phone_number: "0987654321",
    },
  });

  const handleChange = (section, field, value) => {
    setDoctorProfile((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-blue-700">Hồ sơ bác sĩ</h2>
          <div className="space-x-3">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
            </Button>
            <Button
              onClick={() => Navigate("/doctor/change-password")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Đổi mật khẩu
            </Button>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <img
            src={doctorProfile.user.avatar_url}
            alt="Doctor Avatar"
            className="w-32 h-32 rounded-full border-4 border-blue-300 shadow-md object-cover"
          />
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
                    value={doctorProfile.account[field]}
                    onChange={(e) =>
                      handleChange("account", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800">
                    {doctorProfile.account[field]}
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
                    value={doctorProfile.user[field]}
                    onChange={(e) =>
                      handleChange("user", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800">{doctorProfile.user[field]}</p>
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
                    value={doctorProfile.doctor[field]}
                    onChange={(e) =>
                      handleChange("doctor", field, e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ) : (
                  <p className="text-gray-800 whitespace-pre-line">
                    {doctorProfile.doctor[field]}
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
                  value={doctorProfile.doctor.specialties.join(", ")}
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
                  {doctorProfile.doctor.specialties.join(", ")}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorProfile;
