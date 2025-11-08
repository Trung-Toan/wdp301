import { memo, useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  People,
  Calendar,
  FileText,
  ClipboardCheck,
  ChatLeftText,
  List,
  X,
  BoxArrowRight,
  Bell,
  PersonCircle,
} from "react-bootstrap-icons";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { doctorApi } from "../api/doctor/doctorApi";
import { useAuth } from "../hooks/useAuth";
import { logoutApi } from "../api/auth/logout/LogoutApt";
import "../styles/doctor/DoctorLayout.css";

const DoctorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const checkProfileComplete = async () => {
    try {
      setIsLoadingProfile(true);
      const [profileRes, licenseRes] = await Promise.all([
        doctorApi.getProfile(),
        doctorApi.getMyLicense(),
      ]);

      const profile = profileRes.data.data;
      const licenses = licenseRes.data.data || [];

      const hasInfo = profile.title && profile.degree && profile.experience;
      // Kiểm tra có ít nhất 1 license đã được APPROVED và còn hạn
      const hasValidLicense = licenses.some((lic) => {
        if (lic.status !== "APPROVED") return false;
        if (!lic.expiry_date) return true; // Không có ngày hết hạn thì coi như còn hạn
        const expiry = new Date(lic.expiry_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return expiry >= today;
      });

      if (hasInfo && hasValidLicense) {
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false);
      }
    } catch (err) {
      console.error("Không thể tải hồ sơ bác sĩ:", err);
      setIsProfileComplete(false);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    checkProfileComplete();

    // Listen for profile update events
    const handleProfileUpdate = () => {
      checkProfileComplete();
    };

    window.addEventListener("doctorProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("doctorProfileUpdated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (isLoadingProfile) {
      return;
    }

    if (!isProfileComplete && location.pathname !== "/doctor/profile") {
      toast.warn("Vui lòng hoàn tất hồ sơ của bạn trước khi tiếp tục!", {
        position: "top-center",
        autoClose: 5000,
      });
      navigate("/doctor/profile");
    }
  }, [isLoadingProfile, isProfileComplete, location.pathname, navigate]);
  const { logout, user: authUser } = useAuth();

  // Get user from auth context or sessionStorage as fallback
  const user = authUser || JSON.parse(sessionStorage.getItem("user") || "null");

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
      title: "Phê duyệt hồ sơ bệnh án",
      icon: <ClipboardCheck size={20} />,
      link: "/doctor/medical-records",
    },
    {
      title: "Feedback",
      icon: <ChatLeftText size={20} />,
      link: "/doctor/feedback",
    },
  ];

  const handleLogout = async () => {
    try {
      // Gọi API logout với refreshToken
      const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logoutApi.logout(refreshToken);
      }
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      // Vẫn tiếp tục logout local nếu API thất bại
    } finally {
      // Gọi logout từ useAuth để clear auth context
      logout();
      // Clear localStorage nếu có
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      // Navigate về trang login
      navigate("/login");
    }
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

            <div
              className={`user-profile ${
                !isProfileComplete ? "pulse-profile" : ""
              }`}
              onClick={() => navigate("/doctor/profile")}
              style={{ cursor: "pointer" }}
            >
              <PersonCircle size={32} />
              <div className="user-info">
                <span className="user-name">{user?.full_name || user?.name || user?.username || "Bác sĩ"}</span>
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
