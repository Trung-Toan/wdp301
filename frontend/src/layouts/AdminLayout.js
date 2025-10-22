"use client"

import { useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  AlertCircle,
  Ban,
  Shield,
  Bell,
  LogOut,
  User,
} from "lucide-react"

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { id: "dashboard", label: "Tổng quan hệ thống", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "clinics", label: "Quản lý phòng khám", icon: Building2, path: "/admin/clinics" },
    { id: "accounts", label: "Quản lý tài khoản", icon: Users, path: "/admin/accounts" },
    { id: "licenses", label: "Quản lý giấy phép", icon: FileText, path: "/admin/licenses" },
    { id: "complaints", label: "Xem khiếu nại", icon: AlertCircle, path: "/admin/complaints" },
    { id: "banned", label: "Tài khoản bị khóa", icon: Ban, path: "/admin/banned" },
    { id: "blacklist", label: "Danh sách đen", icon: Shield, path: "/admin/blacklist" },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className={`font-bold text-blue-600 text-xl ${!sidebarOpen && "hidden"}`}>MediCare</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2 mt-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t p-4">
          <button className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <LogOut size={18} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3">
          <h1 className="text-lg font-semibold text-gray-800">Hệ thống quản trị MediCare</h1>
          <div className="flex items-center gap-5">
            <button className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2">
              <User size={20} className="text-gray-600" />
              <span className="font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
