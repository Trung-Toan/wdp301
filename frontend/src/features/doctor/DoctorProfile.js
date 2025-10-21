import { memo } from "react";
import { ArrowLeftCircle } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const DoctorProfile = () => {
  const navigate = useNavigate();

  // Dữ liệu tĩnh
  const doctor = {
    title: "Bác sĩ chuyên khoa II",
    degree: "Thạc sĩ - Bác sĩ",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
    workplace: "Bệnh viện Trung Ương Huế",
    rating: 4.8,
    description:
      "Bác sĩ có hơn 10 năm kinh nghiệm trong lĩnh vực nội khoa và điều trị bệnh mãn tính.",
    experience: "10 năm công tác tại Bệnh viện Trung Ương Huế.",
    specialties: ["Nội tổng quát", "Tim mạch", "Hô hấp"],
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeftCircle size={22} />
          <span>Quay lại</span>
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">Hồ sơ bác sĩ</h2>
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
          <p className="mt-3 text-sm text-gray-500 italic">{doctor.degree}</p>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <h3 className="text-xl font-semibold text-gray-800">
            {doctor.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
            <p>
              <span className="font-medium text-gray-700">
                🏥 Nơi làm việc:
              </span>{" "}
              {doctor.workplace}
            </p>
            <p>
              <span className="font-medium text-gray-700">⭐ Đánh giá:</span>{" "}
              {doctor.rating}
            </p>
            <p>
              <span className="font-medium text-gray-700">🧠 Kinh nghiệm:</span>{" "}
              {doctor.experience}
            </p>
            <p>
              <span className="font-medium text-gray-700">👨‍⚕️ Chuyên khoa:</span>{" "}
              {doctor.specialties.join(", ")}
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">🩺 Giới thiệu:</p>
            <p className="text-gray-600 leading-relaxed">
              {doctor.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DoctorProfile);
