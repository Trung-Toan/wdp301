import { memo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  UserPlus,
  MessageSquare,
  Ban,
  ClipboardCheck,
  X,
  List,
  Bell,
} from "lucide-react";
import { PersonCircle, BoxArrowRight, People } from "react-bootstrap-icons";

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
      icon: <ClipboardCheck size={20} />,
      link: "/clinic-admin/overload-alerts",
    },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transition-all duration-300 z-40 flex flex-col shadow-lg ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="border-b border-indigo-700 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-400">
              <ClipboardCheck size={28} className="text-white" />
            </div>
            {sidebarOpen && (
              <span className="whitespace-nowrap text-lg font-bold">
                MediCare
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 no-underline ${
                location.pathname === item.link
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="whitespace-nowrap text-sm font-medium">
                  {item.title}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-indigo-700 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg bg-red-500/20 px-4 py-3 text-red-300 transition-all duration-200 hover:bg-red-500/30"
          >
            <BoxArrowRight size={20} />
            {sidebarOpen && (
              <span className="whitespace-nowrap text-sm font-medium">
                Đăng xuất
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <List size={24} />}
            </button>

            <div className="flex items-center gap-6">
              <button className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100">
                <Bell size={20} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  5
                </span>
              </button>

              <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                <PersonCircle size={32} className="text-indigo-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    Quản lý phòng khám
                  </span>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="m-0 text-sm text-gray-600">
              © 2025 MediCare Clinic Admin. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="/"
                className="text-sm text-gray-600 transition-colors hover:text-indigo-600 no-underline"
              >
                Điều khoản
              </a>
              <a
                href="/"
                className="text-sm text-gray-600 transition-colors hover:text-indigo-600 no-underline"
              >
                Chính sách
              </a>
              <a
                href="/"
                className="text-sm text-gray-600 transition-colors hover:text-indigo-600 no-underline"
              >
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
