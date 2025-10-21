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

  const [isEditing, setIsEditing] = useState(false);
  const [tempDoctor, setTempDoctor] = useState(doctor);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempDoctor({ ...tempDoctor, [name]: value });
  };

  const handleSave = () => {
    setDoctor(tempDoctor);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempDoctor(doctor);
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition font-medium shadow"
          >
            <PencilSquare size={18} />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition font-medium shadow"
            >
              <Check2 size={18} />
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition font-medium shadow"
            >
              <XCircle size={18} />
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={doctor.avatar_url}
            alt="Doctor Avatar"
            className="w-36 h-36 rounded-full border-4 border-blue-100 object-cover shadow-md"
          />
          {isEditing && (
            <input
              type="text"
              name="avatar_url"
              value={tempDoctor.avatar_url}
              onChange={handleChange}
              placeholder="Link ảnh đại diện"
              className="mt-3 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          )}
        </div>

        {/* Thông tin */}
        <div className="space-y-5">
          <ProfileField
            label="Chức danh"
            name="title"
            value={tempDoctor.title}
            isEditing={isEditing}
            onChange={handleChange}
          />
          <ProfileField
            label="Học vị"
            name="degree"
            value={tempDoctor.degree}
            isEditing={isEditing}
            onChange={handleChange}
          />
          <ProfileField
            label="Nơi làm việc"
            name="workplace"
            value={tempDoctor.workplace}
            isEditing={isEditing}
            onChange={handleChange}
          />
          <ProfileField
            label="Kinh nghiệm"
            name="experience"
            value={tempDoctor.experience}
            isEditing={isEditing}
            onChange={handleChange}
          />
          <ProfileField
            label="Chuyên khoa"
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
          <ProfileField
            label="Đánh giá"
            name="rating"
            value={tempDoctor.rating}
            isEditing={isEditing}
            onChange={handleChange}
          />

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Giới thiệu
            </label>
            {isEditing ? (
              <textarea
                name="description"
                value={tempDoctor.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed bg-gray-50 border border-gray-100 rounded-md p-3">
                {doctor.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con cho từng trường
const ProfileField = ({ label, name, value, isEditing, onChange }) => {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      ) : (
        <p className="text-gray-700 bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
          {value}
        </p>
      )}
    </div>
  );
};

export default memo(DoctorProfile);
