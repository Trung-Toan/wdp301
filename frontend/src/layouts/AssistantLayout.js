import { memo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  People,
  Calendar,
  ClipboardCheck,
  List,
  X,
  BoxArrowRight,
  Bell,
  PersonCircle,
} from "react-bootstrap-icons";
import { useAuth } from "../hooks/useAuth";
import { logoutApi } from "../api/auth/logout/LogoutApt";
import "../styles/doctor/DoctorLayout.css";
const { useDataByUrl } = require("../utility/data.utils");

const DoctorLayout = () => {
  const { data } = useDataByUrl({
    url: "/assistant/profile",
    key: "assistantProfile",
  });

  const profile = data?.data?.information || {};
  const assistantProfile = data?.data?.assistant || {};
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menusByType = {
    RECEPTIONIST: [
      {
        title: "Trang chủ",
        icon: <House size={20} />,
        link: "/assistant/dashboard",
      },
      {
        title: "Duyệt lịch khám",
        icon: <ClipboardCheck size={20} />,
        link: "/assistant/appointments",
      },
      
    ],
    NURSE: [
      {
        title: "Trang chủ",
        icon: <House size={20} />,
        link: "/assistant/dashboard",
      },
      {
        title: "Bệnh nhân",
        icon: <People size={20} />,
        link: "/assistant/patients",
      },
      {
        title: "Tạo lịch khám cho bác sĩ",
        icon: <Calendar size={20} />,
        link: "/assistant/slot-schedule",
      },
    ],
  };

  // 🟢 Lấy menu tương ứng với type (hoặc rỗng)
  const menuItems = menusByType[assistantProfile?.type] || [];
  const { logout } = useAuth();

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

        {/* 🟢 Render menu bằng map */}
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

            <div className="user-profile">
              <PersonCircle size={32} />
              <div className="user-info">
                <span className="user-name">
                  Trợ lý. {profile?.full_name || "Nguyễn Văn A"}
                </span>
                <span className="user-role">
                  {assistantProfile?.type === "RECEPTIONIST"
                    ? "Lễ tân"
                    : assistantProfile?.type === "NURSE"
                    ? "Y tá"
                    : "Trợ lý"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
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
