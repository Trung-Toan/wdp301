import { memo, useState } from "react";
import {
  ArrowLeftCircle,
  PencilSquare,
  Check2,
  XCircle,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const DoctorProfile = () => {
  const navigate = useNavigate();

  // Dữ liệu tĩnh ban đầu
  const [doctor, setDoctor] = useState({
    title: "Bác sĩ chuyên khoa II",
    degree: "Thạc sĩ - Bác sĩ",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
    workplace: "Bệnh viện Trung Ương Huế",
    rating: 4.8,
    description:
      "Bác sĩ có hơn 10 năm kinh nghiệm trong lĩnh vực nội khoa và điều trị bệnh mãn tính.",
    experience: "10 năm công tác tại Bệnh viện Trung Ương Huế.",
    specialties: ["Nội tổng quát", "Tim mạch", "Hô hấp"],
  });

  // State cho chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [tempDoctor, setTempDoctor] = useState(doctor);

  // Hàm xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempDoctor({ ...tempDoctor, [name]: value });
  };

  // Lưu thay đổi
  const handleSave = () => {
    setDoctor(tempDoctor);
    setIsEditing(false);
  };

  // Hủy thay đổi
  const handleCancel = () => {
    setTempDoctor(doctor);
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeftCircle size={22} />
            <span>Quay lại</span>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Hồ sơ bác sĩ</h2>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            <PencilSquare size={18} />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Check2 size={18} />
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition"
            >
              <XCircle size={18} />
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* Card Profile */}
      <div className="bg-white rounded-2xl shadow-md p-6 md:flex gap-8 items-start">
        {/* Avatar */}
        <div className="flex flex-col items-center md:w-1/4 mb-6 md:mb-0">
          <img
            src={doctor.avatar_url}
            alt="Doctor Avatar"
            className="w-40 h-40 rounded-full border-4 border-gray-200 object-cover shadow-sm"
          />
          {isEditing && (
            <input
              type="text"
              name="avatar_url"
              value={tempDoctor.avatar_url}
              onChange={handleChange}
              placeholder="Link ảnh đại diện"
              className="mt-3 w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          {isEditing ? (
            <>
              <input
                type="text"
                name="title"
                value={tempDoctor.title}
                onChange={handleChange}
                className="text-xl font-semibold text-gray-800 border-b border-gray-300 w-full focus:outline-none"
              />
              <input
                type="text"
                name="degree"
                value={tempDoctor.degree}
                onChange={handleChange}
                className="italic text-gray-600 border-b border-gray-300 w-full focus:outline-none"
              />
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-800">
                {doctor.title}
              </h3>
              <p className="italic text-gray-600">{doctor.degree}</p>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
            <ProfileField
              label="🏥 Nơi làm việc"
              name="workplace"
              value={tempDoctor.workplace}
              isEditing={isEditing}
              onChange={handleChange}
            />
            <ProfileField
              label="⭐ Đánh giá"
              name="rating"
              value={tempDoctor.rating}
              isEditing={isEditing}
              onChange={handleChange}
            />
            <ProfileField
              label="🧠 Kinh nghiệm"
              name="experience"
              value={tempDoctor.experience}
              isEditing={isEditing}
              onChange={handleChange}
            />
            <ProfileField
              label="👨‍⚕️ Chuyên khoa"
              name="specialties"
              value={tempDoctor.specialties.join(", ")}
              isEditing={isEditing}
              onChange={(e) =>
                setTempDoctor({
                  ...tempDoctor,
                  specialties: e.target.value.split(",").map((s) => s.trim()),
                })
              }
            />
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">🩺 Giới thiệu:</p>
            {isEditing ? (
              <textarea
                name="description"
                value={tempDoctor.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring focus:ring-blue-200"
                rows={4}
              />
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {doctor.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con cho các field đơn giản
const ProfileField = ({ label, name, value, isEditing, onChange }) => {
  return (
    <div>
      <span className="font-medium text-gray-700">{label}:</span>{" "}
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="border-b border-gray-300 focus:outline-none w-full"
        />
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
};

export default memo(DoctorProfile);
