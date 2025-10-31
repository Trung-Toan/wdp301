import { memo, useState, useEffect } from "react"; // Thêm useEffect
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  People,
  Calendar,
  FileText,
  ClipboardCheck,
  BellSlash,
  ChatLeftText,
  PersonBadge,
  List,
  X,
  BoxArrowRight,
  Bell,
  PersonCircle,
} from "react-bootstrap-icons";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { doctorApi } from "../api/doctor/doctorApi";
import "../styles/doctor/DoctorLayout.css";

const DoctorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user"));

  // --- THÊM STATE MỚI ---
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  // ---------------------

  // --- THÊM EFFECT (1): TẢI HỒ SƠ ĐỂ KIỂM TRA ---
  useEffect(() => {
    const fetchProfileAndLicenses = async () => {
      try {
        // Gọi song song 2 API (giống như trang DoctorProfile)
        const [profileRes, licenseRes] = await Promise.all([
          doctorApi.getProfile(),
          doctorApi.getMyLicense(),
        ]);

        const profile = profileRes.data.data;
        const licenses = licenseRes.data.data || [];

        // Điều kiện kiểm tra
        const hasInfo = profile.title && profile.degree && profile.experience;
        const hasLicense = licenses.length > 0;

        if (hasInfo && hasLicense) {
          setIsProfileComplete(true);
        } else {
          setIsProfileComplete(false);
        }
      } catch (err) {
        console.error("Không thể tải hồ sơ bác sĩ:", err);
        // Giả sử nếu lỗi thì hồ sơ chưa hoàn tất
        setIsProfileComplete(false);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileAndLicenses();
  }, []); // Chỉ chạy 1 lần khi layout mount

  // --- THÊM EFFECT (2): KIỂM TRA VÀ CHUYỂN HƯỚNG ---
  useEffect(() => {
    if (isLoadingProfile) {
      return; // Chưa tải xong, không làm gì cả
    }

    // Nếu hồ sơ CHƯA hoàn tất VÀ bác sĩ KHÔNG ở trang profile
    if (!isProfileComplete && location.pathname !== "/doctor/profile") {
      toast.warn("Vui lòng hoàn tất hồ sơ của bạn trước khi tiếp tục!", {
        position: "top-center",
        autoClose: 5000,
      });
      navigate("/doctor/profile"); // Bắt buộc chuyển về trang profile
    }
  }, [isLoadingProfile, isProfileComplete, location.pathname, navigate]);
  // ------------------------------------------------

  const menuItems = [
    {
      title: "Trang chủ",
      icon: <House size={20} />,
      link: "/doctor/dashboard",
    },
    {
      title: "Bệnh nhân",
      icon: <People size={20} />,
      link: "/doctor/patients",
    },
    {
      title: "Lịch khám",
      icon: <Calendar size={20} />,
      link: "/doctor/appointments",
    },
    {
      title: "Yêu cầu xem bệnh án",
      icon: <FileText size={20} />,
      link: "/doctor/record-requests",
    },
    {
      title: "Hồ sơ bệnh án",
      icon: <ClipboardCheck size={20} />,
      link: "/doctor/medical-records",
    },
    {
      title: "Feedback",
      icon: <ChatLeftText size={20} />,
      link: "/doctor/feedback",
    },
    {
      title: "Quản lý trợ lý",
      icon: <PersonBadge size={20} />,
      link: "/doctor/assistants",
    },
    {
      title: "Thông báo nghỉ",
      icon: <BellSlash size={20} />,
      link: "/doctor/absence",
    },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/home");
  };

  return (
    <div className="doctor-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <ClipboardCheck size={28} />
            </div>
            {sidebarOpen && <span className="logo-text">MediCare</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`nav-item ${
                location.pathname === item.link ? "nav-item-active" : ""
              }`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-text">{item.title}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <BoxArrowRight size={20} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="toggle-sidebar-btn"
          >
            {sidebarOpen ? <X size={24} /> : <List size={24} />}
          </button>

          <div className="header-right">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>

            {/* CẬP NHẬT Ở ĐÂY: Thêm class "pulse-profile" nếu hồ sơ chưa hoàn tất */}
            <div
              className={`user-profile ${
                !isProfileComplete ? "pulse-profile" : ""
              }`}
              onClick={() => navigate("/doctor/profile")}
              style={{ cursor: "pointer" }}
            >
              <PersonCircle size={32} />
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">Bác sĩ</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {!isProfileComplete && location.pathname !== "/doctor/profile" && (
            <div className="profile-blocker-overlay">
              <Spinner animation="border" variant="light" className="mb-3" />
              <h3 className="text-white">Yêu cầu hoàn tất hồ sơ</h3>
              <p className="text-white-50 mb-4">
                Bạn cần cập nhật thông tin (Chức danh, Bằng cấp, Kinh nghiệm) và
                tải lên ít nhất 1 chứng chỉ hành nghề để sử dụng các tính năng
                khác.
              </p>
              <Button
                variant="light"
                onClick={() => navigate("/doctor/profile")}
              >
                Đi đến trang hồ sơ
              </Button>
            </div>
          )}
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-text">© 2025 MediCare. All rights reserved.</p>
            <div className="footer-links">
              <Link to="#" className="footer-link">
                Điều khoản
              </Link>
              <Link to="#" className="footer-link">
                Chính sách
              </Link>
              <Link to="#" className="footer-link">
                Hỗ trợ
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default memo(DoctorLayout);
