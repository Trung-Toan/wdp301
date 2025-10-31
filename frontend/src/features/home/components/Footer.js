import { 
    Facebook, 
    Twitter, 
    Instagram, 
    Youtube, 
    Phone, 
    Mail, 
    MapPin,
    Calendar,
    Stethoscope,
    FileText,
    Shield,
    HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import "../../../styles/Footer.css";

export default function Footer() {
    return (
        <footer className="footer-modern">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Logo + Description */}
                    <div className="footer-section">
                        <Link to="/home" className="footer-logo-wrapper">
                            <div className="footer-logo-icon">
                                <span className="footer-logo-text">M+</span>
                            </div>
                            <span className="footer-logo-name">MediSched</span>
                        </Link>
                        <p className="footer-description">
                            Nền tảng đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam, kết nối bạn với các bác sĩ và cơ sở y tế uy tín.
                        </p>
                    </div>

                    {/* Services */}
                    <div className="footer-section">
                        <h3 className="footer-section-title">Dịch vụ</h3>
                        <ul className="footer-links">
                            <li className="footer-link-item">
                                <Link to="/home/specialty" className="footer-link">
                                    <Calendar size={16} />
                                    <span>Đặt lịch khám</span>
                                </Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="/home/doctorlist" className="footer-link">
                                    <Stethoscope size={16} />
                                    <span>Tư vấn trực tuyến</span>
                                </Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="/home/facility" className="footer-link">
                                    <FileText size={16} />
                                    <span>Xét nghiệm tại nhà</span>
                                </Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="#" className="footer-link">
                                    <Stethoscope size={16} />
                                    <span>Gói khám sức khỏe</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-section">
                        <h3 className="footer-section-title">Hỗ trợ</h3>
                        <ul className="footer-links">
                            <li className="footer-link-item">
                                <Link to="#" className="footer-link">
                                    <HelpCircle size={16} />
                                    <span>Câu hỏi thường gặp</span>
                                </Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="#" className="footer-link">
                                    <FileText size={16} />
                                    <span>Hướng dẫn sử dụng</span>
                                </Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="#" className="footer-link">
                                    <Shield size={16} />
                                    <span>Chính sách bảo mật</span>
                                </Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="#" className="footer-link">
                                    <FileText size={16} />
                                    <span>Điều khoản sử dụng</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact + Socials */}
                    <div className="footer-section">
                        <h3 className="footer-section-title">Liên hệ</h3>
                        <ul className="footer-contact-list">
                            <li className="footer-contact-item">
                                <Phone className="footer-contact-icon" />
                                <span>Hotline: 1900 xxxx</span>
                            </li>
                            <li className="footer-contact-item">
                                <Mail className="footer-contact-icon" />
                                <span>support@medisched.vn</span>
                            </li>
                            <li className="footer-contact-item">
                                <MapPin className="footer-contact-icon" />
                                <span>Hà Nội, Việt Nam</span>
                            </li>
                        </ul>

                        <div className="footer-social-wrapper">
                            <div className="footer-social-title">Theo dõi chúng tôi</div>
                            <div className="footer-social-links">
                                <Link to="#" className="footer-social-link" aria-label="Facebook">
                                    <Facebook size={20} />
                                </Link>
                                <Link to="#" className="footer-social-link" aria-label="Twitter">
                                    <Twitter size={20} />
                                </Link>
                                <Link to="#" className="footer-social-link" aria-label="Instagram">
                                    <Instagram size={20} />
                                </Link>
                                <Link to="#" className="footer-social-link" aria-label="YouTube">
                                    <Youtube size={20} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © 2025 MediSched. All rights reserved.
                    </p>
                    <div className="footer-bottom-links">
                        <Link to="#" className="footer-bottom-link">Chính sách bảo mật</Link>
                        <Link to="#" className="footer-bottom-link">Điều khoản sử dụng</Link>
                        <Link to="#" className="footer-bottom-link">Liên hệ</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
