import { memo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  People,
  UserPlus,
  MessageSquare,
  Ban,
  AlertTriangle,
  X,
  List,
  Bell,
  PersonCircle,
  BoxArrowRight,
} from "lucide-react";
// import "../styles/clinic-admin/ClinicAdminLayout.css";

const ClinicAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Trang chủ",
      icon: <House size={20} />,
      link: "/clinic-admin/dashboard",
    },
    {
      title: "Quản lý bác sĩ",
      icon: <People size={20} />,
      link: "/clinic-admin/doctors",
    },
    {
      title: "Quản lý trợ lý",
      icon: <UserPlus size={20} />,
      link: "/clinic-admin/assistants",
    },
    {
      title: "Feedback bệnh nhân",
      icon: <MessageSquare size={20} />,
      link: "/clinic-admin/feedback",
    },
    {
      title: "Danh sách đen",
      icon: <Ban size={20} />,
      link: "/clinic-admin/blacklist",
    },
    {
      title: "Cảnh báo quá tải",
      icon: <AlertTriangle size={20} />,
      link: "/clinic-admin/overload-alerts",
    },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="clinic-admin-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <AlertTriangle size={28} />
            </div>
            {sidebarOpen && <span className="logo-text">Clinic Admin</span>}
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
              <span className="notification-badge">5</span>
            </button>

            <div className="user-profile">
              <PersonCircle size={32} />
              <div className="user-info">
                <span className="user-name">Quản lý phòng khám</span>
                <span className="user-role">Admin</span>
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
            <p className="footer-text">
              © 2025 MediCare Clinic Admin. All rights reserved.
            </p>
            <div className="footer-links">
              <a href="/" className="footer-link">
                Điều khoản
              </a>
              <a href="/" className="footer-link">
                Chính sách
              </a>
              <a href="/" className="footer-link">
                Hỗ trợ
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default memo(ClinicAdminLayout);