import { Menu, Search, Bell } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSessionStorage } from "../../../hooks/useSessionStorage";
import { Dropdown } from "react-bootstrap";
import {
  PersonCircle,
  BoxArrowRight,
  Receipt,
  InfoCircle,
  LockFill,
} from "react-bootstrap-icons";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useSessionStorage("user");
  const patients = useSessionStorage("patient");
  console.log(patients);
  console.log(user);
  const navigate = useNavigate();

  const onLogout = () => {
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/home" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xl font-bold text-white">M+</span>
            </div>
            <span className="text-xl font-bold text-gray-800">MediSched</span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/home"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Trang chủ
            </Link>
            <a
              href="/home/specialty"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Chuyên khoa
            </a>
            <a
              href="/home/doctorlist"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Bác sĩ
            </a>
            <a
              href="/home/facility"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Cơ sở y tế
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Về chúng tôi
            </a>
          </nav>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="hidden md:flex p-2 rounded-full hover:bg-gray-100">
            <Search className="h-5 w-5 text-gray-700" />
          </button>

          {/* Notifications */}
          <button className="hidden md:flex p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-700" />
          </button>

          {/* Logged-in user menu */}
          {user ? (
            <>
              <Link
                to="list_invoice"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <Receipt className="me-1" /> Invoice
              </Link>
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-basic"
                >
                  <PersonCircle size={24} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>
                    Hello, {user?.fullName || "you"}!
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="information">
                    <InfoCircle className="me-2" />
                    View information
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="list_invoice">
                    <Receipt className="me-2" />
                    View payment invoice
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="change_password">
                    <LockFill className="me-2" />
                    Change password
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={onLogout}>
                    <BoxArrowRight className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Link to="/home" className="text-sm font-medium text-gray-700">
              Trang chủ
            </Link>
            <a href="/home/specialty" className="text-sm font-medium text-gray-600">
              Chuyên khoa
            </a>
            <a href="#doctors" className="text-sm font-medium text-gray-600">
              Bác sĩ
            </a>
            <a href="#facilities" className="text-sm font-medium text-gray-600">
              Cơ sở y tế
            </a>
            <a href="#about" className="text-sm font-medium text-gray-600">
              Về chúng tôi
            </a>
            {user ? (
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
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
