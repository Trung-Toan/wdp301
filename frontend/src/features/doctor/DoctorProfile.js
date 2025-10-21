import { memo } from "react";
import { Card, Button } from "react-bootstrap";
import { ArrowLeftCircle } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import "../../styles/doctor/DoctorProfile.css";

const DoctorProfile = () => {
  const navigate = useNavigate();

  // DỮ LIỆU TĨNH MÔ PHỎNG TỪ SCHEMA
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
    <div className="doctor-profile-container">
      <div className="profile-header">
        <Button variant="light" onClick={() => navigate(-1)}>
          <ArrowLeftCircle size={20} /> Quay lại
        </Button>
        <h2>Hồ sơ bác sĩ</h2>
      </div>

      <Card className="doctor-profile-card">
        <div className="profile-avatar">
          <img src={doctor.avatar_url} alt="Doctor Avatar" />
        </div>
        <div className="profile-info">
          <h3>{doctor.title}</h3>
          <p className="degree">{doctor.degree}</p>
          <p>
            <strong>Nơi làm việc:</strong> {doctor.workplace}
          </p>
          <p>
            <strong>Kinh nghiệm:</strong> {doctor.experience}
          </p>
          <p>
            <strong>Chuyên khoa:</strong> {doctor.specialties.join(", ")}
          </p>
          <p>
            <strong>Giới thiệu:</strong> {doctor.description}
          </p>
          <p>
            <strong>Đánh giá:</strong> ⭐ {doctor.rating}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default memo(DoctorProfile);
