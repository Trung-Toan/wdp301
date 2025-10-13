import React, { memo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  People,
  Calendar,
  FileText,
  CheckCircle,
  ChatLeftText,
  Bell,
  Gear,
  List,
  X,
  BoxArrowRight,
  PersonCircle,
} from "react-bootstrap-icons";
import "../styles/assistant/AssistantLayout.css";

const AssistantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { title: "Trang chủ", icon: <House size={18} />, link: "/assistant" },
    {
      title: "Bệnh nhân",
      icon: <People size={20} />,
      link: "/assistant/patients",
    },
    {
      title: "Lịch làm việc",
      icon: <Calendar size={20} />,
      link: "/assistant/schedule",
    },
    {
      title: "Yêu cầu hồ sơ",
      icon: <FileText size={20} />,
      link: "/assistant/record-requests",
    },
    {
      title: "Chuẩn bị đơn thuốc",
      icon: <CheckCircle size={20} />,
      link: "/assistant/prescriptions",
    },
    {
      title: "Chat",
      icon: <ChatLeftText size={20} />,
      link: "/assistant/chats",
    },
    {
      title: "Thông báo",
      icon: <Bell size={20} />,
      link: "/assistant/notifications",
    },
    { title: "Cài đặt", icon: <Gear size={20} />, link: "/assistant/settings" },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="assistant-layout">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="logo">{sidebarOpen ? "Assistant" : "A"}</div>
        <nav>
          {menuItems.map((m) => (
            <Link
              key={m.link}
              to={m.link}
              className={location.pathname === m.link ? "active" : ""}
            >
              <span className="icon">{m.icon}</span>
              {sidebarOpen && <span className="text">{m.title}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout}>
            <BoxArrowRight /> {sidebarOpen && "Đăng xuất"}
          </button>
        </div>
      </aside>

      <div className="main">
        <header>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <List />}
          </button>
          <div className="right">
            <Bell />
            <div className="profile">
              <PersonCircle /> <span>Trợ lý</span>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>

        <footer>© 2025</footer>
      </div>
    </div>
  );
};

export default memo(AssistantLayout);
