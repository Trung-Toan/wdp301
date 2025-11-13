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

  // Hỗ trợ nhiều role: type có thể là mảng hoặc string (tương thích ngược)
  const roles = Array.isArray(assistantProfile?.type)
    ? assistantProfile.type
    : assistantProfile?.type
    ? [assistantProfile.type]
    : [];

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Menu theo từng vai trò
  const MENUS_BY_ROLE = {
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
      {
        title: "Tạo hồ sơ bệnh án",
        icon: <ClipboardCheck size={20} />,
        link: "/assistant/appointments",
      },
    ],
  };

  // Hợp nhất menu từ nhiều roles → loại trùng theo link
  const menuItems = roles
    .flatMap((r) => MENUS_BY_ROLE[r] || [])
    .reduce((acc, item) => {
      if (!acc.some((x) => x.link === item.link)) acc.push(item);
      return acc;
    }, []);

  // Nếu không có role khớp, fallback an toàn (tránh rỗng)
  const effectiveMenu = menuItems.length
    ? menuItems
    : MENUS_BY_ROLE.RECEPTIONIST || [];

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

  // Mapping label vai trò để hiển thị badge
  const roleLabels = {
    RECEPTIONIST: "Lễ tân",
    NURSE: "Y tá",
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

        {/* Menu */}
        <nav className="sidebar-nav">
          {effectiveMenu.map((item, index) => {
            const active =
              location.pathname === item.link ||
              location.pathname.startsWith(item.link + "/");
            return (
              <Link
                key={index}
                to={item.link}
                className={`nav-item ${active ? "nav-item-active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-text">{item.title}</span>}
              </Link>
            );
          })}
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
            aria-label={sidebarOpen ? "Đóng sidebar" : "Mở sidebar"}
          >
            {sidebarOpen ? <X size={24} /> : <List size={24} />}
          </button>

          <div className="header-right">
            <button className="notification-btn" aria-label="Thông báo">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>

            <div
              className={`user-profile`}
              onClick={() => navigate("/assistant/profile")}
              style={{ cursor: "pointer" }}
            >
              <PersonCircle size={32} />
              <div className="user-info">
                <span className="user-name">
                  Trợ lý. {profile?.full_name || "Nguyễn Văn A"}
                </span>

                {/* Vai trò: hiển thị nhiều badge nếu có nhiều role */}
                <span className="user-role" style={{ display: "block" }}>
                  {roles.length > 0 ? (
                    <span className="inline-badges">
                      {roles.map((r) => (
                        <span key={r} className="role-badge">
                          {roleLabels[r] || r}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="role-badge">Trợ lý</span>
                  )}
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

      {/* Inline style cho badge vai trò (hoặc thêm vào CSS của bạn) */}
      <style>{`
        .inline-badges { display: inline-flex; gap: 6px; flex-wrap: wrap; }
        .role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          background: #eef6ff; color: #1e66f5;
          border: 1px solid #cfe3ff; border-radius: 9999px;
          padding: 4px 10px;
        }
      `}</style>
    </div>
  );
};

export default memo(DoctorLayout);
