import { memo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  AlertCircle,
  Ban,
  Shield,
  X,
  List,
  Bell,
  UserCircle,
  LogOut,
} from "lucide-react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { title: "Tổng quan hệ thống", icon: <LayoutDashboard size={20} />, link: "/admin/dashboard" },
    { title: "Quản lý phòng khám", icon: <Building2 size={20} />, link: "/admin/clinics" },
    { title: "Quản lý tài khoản", icon: <Users size={20} />, link: "/admin/accounts" },
    { title: "Quản lý giấy phép", icon: <FileText size={20} />, link: "/admin/licenses" },
    { title: "Xem khiếu nại", icon: <AlertCircle size={20} />, link: "/admin/complaints" },
    { title: "Tài khoản bị khóa", icon: <Ban size={20} />, link: "/admin/banned" },
    { title: "Danh sách đen", icon: <Shield size={20} />, link: "/admin/blacklist" },
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
              <Shield size={28} />
            </div>
            {sidebarOpen && <span className="logo-text">MediCare Admin</span>}
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
            <LogOut size={20} />
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
              <UserCircle size={32} />
              <div className="user-info">
                <span className="user-name">Quản trị viên</span>
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
              © 2025 MediCare Admin System. All rights reserved.
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

export default memo(AdminLayout);
