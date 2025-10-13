import { memo, useState } from "react";
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
import "../styles/doctor/DoctorLayout.css";

const DoctorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
    navigate("/login");
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

            <div className="user-profile">
              <PersonCircle size={32} />
              <div className="user-info">
                <span className="user-name">BS. Nguyễn Văn A</span>
                <span className="user-role">Bác sĩ</span>
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
              <a href="#" className="footer-link">
                Điều khoản
              </a>
              <a href="#" className="footer-link">
                Chính sách
              </a>
              <a href="#" className="footer-link">
                Hỗ trợ
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default memo(DoctorLayout);
