import { Calendar, Menu, X, Home, Stethoscope, Users, Building2, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSessionStorage } from "../../../hooks/useSessionStorage";
import {
  PersonCircle,
  BoxArrowRight,
  InfoCircle,
} from "react-bootstrap-icons";
import NotificationDropdown from "./NotificationDropdown";
import { logoutApi } from "../../../api/auth/logout/LogoutApt";
import { useAuth } from "../../../hooks/useAuth";
import "../../../styles/Header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user: authUser } = useAuth();
  const sessionUser = useSessionStorage("user");
  const user = authUser || sessionUser;
  const navigate = useNavigate();
  const { logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const onLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
      await logoutApi.logout(refreshToken);
      logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      logout();
      navigate("/login");
    }
  };

  const navItems = [
    { label: "Trang chủ", link: "/home", icon: Home },
    { label: "Chuyên khoa", link: "/home/specialty", icon: Stethoscope },
    { label: "Bác sĩ", link: "/home/doctorlist", icon: Users },
    { label: "Cơ sở y tế", link: "/home/facility", icon: Building2 },
  ];

  const isActive = (path) => {
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };


  return (
    <header className={`header-modern ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo-section">
          <Link
            to="/home"
            className="header-logo-link"
          >
            <div className="header-logo-icon">
              <span className="header-logo-text">M+</span>
            </div>
            <span className="header-logo-name">MediSched</span>
          </Link>

          {/* Menu Desktop */}
          <nav className="header-nav-desktop">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.link}
                  className={`header-nav-link ${isActive(item.link) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <IconComponent size={18} className="header-nav-icon" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions */}
        <div className="header-actions">
          {/* Notifications - Chỉ hiện khi đã đăng nhập */}
          {user && <NotificationDropdown />}

          {/* User dropdown */}
          {user ? (
            <div className="header-user-dropdown-wrapper" ref={dropdownRef}>
              <button
                className={`header-user-toggle ${isUserDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                aria-label="User menu"
              >
                <div className="header-user-avatar">
                  <PersonCircle size={22} />
                </div>
                <span className="header-user-name">
                  {user?.full_name || user?.name || "User"}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`header-dropdown-chevron ${isUserDropdownOpen ? 'rotate' : ''}`}
                />
              </button>

              <div className={`header-dropdown-menu ${isUserDropdownOpen ? 'show' : ''}`}>
                <div className="header-dropdown-header">
                  <div className="header-dropdown-greeting">Xin chào,</div>
                  <div className="header-dropdown-name">
                    {user?.full_name || user?.name || "User"}
                  </div>
                </div>
                <div className="header-dropdown-divider"></div>
                <Link
                  to="/patient/profile"
                  className="header-dropdown-item"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <InfoCircle size={18} />
                  <span>Thông tin cá nhân</span>
                </Link>
                <div className="header-dropdown-divider"></div>
                <Link
                  to="/patient/appointments"
                  className="header-dropdown-item"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Calendar size={18} />
                  <span>Lịch hẹn của tôi</span>
                </Link>
                <div className="header-dropdown-divider"></div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsUserDropdownOpen(false);
                  }}
                  className="header-dropdown-item header-dropdown-item-logout"
                >
                  <BoxArrowRight size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>

          ) : (
            <Link
              to="/login"
              className="header-login-btn"
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="header-mobile-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className={`header-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <nav className="header-mobile-nav">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.label}
                to={item.link}
                className={`header-mobile-link ${isActive(item.link) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {user ? (
            <>
              <Link
                to="/patient/profile"
                className="header-mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <InfoCircle size={20} />
                <span>Thông tin cá nhân</span>
              </Link>
              <Link
                to="/patient/appointments"
                className="header-mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar size={20} />
                <span>Lịch hẹn của tôi</span>
              </Link>
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="header-mobile-logout"
              >
                <BoxArrowRight size={20} />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="header-mobile-login"
              onClick={() => setIsMenuOpen(false)}
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
