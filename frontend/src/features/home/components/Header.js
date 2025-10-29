import { Calendar, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSessionStorage } from "../../../hooks/useSessionStorage";
import { Dropdown } from "react-bootstrap";
import {
  PersonCircle,
  BoxArrowRight,
  InfoCircle,
} from "react-bootstrap-icons";
import NotificationDropdown from "./NotificationDropdown";
import { logoutApi } from "../../../api/auth/logout/LogoutApt";
import { useAuth } from "../../../hooks/useAuth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user: authUser } = useAuth();
  const sessionUser = useSessionStorage("user");
  const user = authUser || sessionUser; // Prioritize authUser from context
  const navigate = useNavigate();
  console.log("information: ", user);
  const { logout } = useAuth();
  const onLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
      await logoutApi.logout(refreshToken); // gọi API logout với refreshToken
      logout();
      localStorage.removeItem("token"); // xóa token (nếu bạn lưu token ở đây)
      localStorage.removeItem("user");  // xóa thông tin người dùng (nếu có)
      navigate("/login"); // điều hướng về trang đăng nhập
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      // Vẫn logout local nếu API thất bại
      logout();
      navigate("/login");
    }
  };


  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            to="/home"
            className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-sm">
              <span className="text-xl font-extrabold text-white">M+</span>
            </div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-sky-600 transition-colors">
              MediSched
            </span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Trang chủ", link: "/home" },
              { label: "Chuyên khoa", link: "/home/specialty" },
              { label: "Bác sĩ", link: "/home/doctorlist" },
              { label: "Cơ sở y tế", link: "/home/facility" },
              { label: "Về chúng tôi", link: "/about" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.link}
                className="text-sm font-medium text-gray-600 hover:text-sky-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Notifications - Chỉ hiện khi đã đăng nhập */}
          {user && <NotificationDropdown />}

          {/* User dropdown */}
          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline-light"
                id="dropdown-basic"
                className="flex items-center gap-2 bg-sky-50 text-sky-700 border-none hover:bg-sky-100 rounded-xl px-3 py-1 transition-all shadow-sm"
              >
                <PersonCircle size={22} />
                <span className="hidden sm:block font-medium">
                  {user?.full_name || "User"}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="rounded-xl shadow-lg border border-blue-100 mt-2 overflow-hidden"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e0f2fe", // sky-100
                }}
              >
                <Dropdown.Header className="text-center text-gray-700">
                  Xin chào, <span className="font-semibold">{user?.full_name}</span> 👋
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item
                  as={Link}
                  to="/patient/profile"
                  className="flex items-center gap-2 text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors duration-150"
                >
                  <InfoCircle /> Thông tin cá nhân
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  as={Link}
                  to="/patient/appointment"
                  className="flex items-center gap-2 text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors duration-150"
                >
                  <Calendar /> Lịch hẹn
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={onLogout}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                >
                  <BoxArrowRight /> Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

          ) : (
            <Link
              to="/login"
              className="hidden md:flex px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-sm hover:shadow-md transition-all duration-300"
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile Menu */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-sky-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="border-t bg-white md:hidden shadow-sm animate-fadeIn">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
            {[
              { label: "Trang chủ", link: "/home" },
              { label: "Chuyên khoa", link: "/home/specialty" },
              { label: "Bác sĩ", link: "/home/doctorlist" },
              { label: "Cơ sở y tế", link: "/home/facility" },
              { label: "Về chúng tôi", link: "/about" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.link}
                className="text-sm font-medium text-gray-700 hover:text-sky-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
              >
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/login"
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium hover:shadow-md transition-all"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
