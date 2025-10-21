"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Building2,
  Users,
  FileText,
  AlertCircle,
  Ban,
  Shield,
  BarChart3,
} from "lucide-react";
import "./styles/AdminLayout.css";

const AdminLayout = ({ children, currentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    {
      id: "dashboard",
      label: "System Dashboard",
      icon: BarChart3,
      path: "/admin/dashboard",
    },
    {
      id: "clinics",
      label: "Manage Clinics",
      icon: Building2,
      path: "/admin/clinics",
    },
    {
      id: "accounts",
      label: "Manage Accounts",
      icon: Users,
      path: "/admin/accounts",
    },
    {
      id: "licenses",
      label: "Manage Licenses",
      icon: FileText,
      path: "/admin/licenses",
    },
    {
      id: "complaints",
      label: "Review Complaints",
      icon: AlertCircle,
      path: "/admin/complaints",
    },
    {
      id: "banned",
      label: "Banned Accounts",
      icon: Ban,
      path: "/admin/banned-accounts",
    },
    {
      id: "blacklist",
      label: "Manage Blacklist",
      icon: Shield,
      path: "/admin/blacklist",
    },
  ];

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="header-content">
            <h1>Clinic Management System</h1>
          </div>

          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-menu">
              <button className="user-btn">
                <User size={20} />
                <span>Admin</span>
              </button>
              <div className="dropdown-menu">
                <a href="#profile">Profile</a>
                <a href="#settings">Settings</a>
                <a href="#logout">
                  <LogOut size={16} />
                  Logout
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
