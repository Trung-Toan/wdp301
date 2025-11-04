import { Link } from "react-router-dom"
import { ArrowRight, Calendar, Stethoscope } from "lucide-react"
import { useAuth } from "../../../../hooks/useAuth"
import { useSessionStorage } from "../../../../hooks/useSessionStorage"
import "../../../../styles/CTASection.css"

export default function CTASection() {
    const { user: authUser } = useAuth()
    const sessionUser = useSessionStorage("user")
    const user = authUser || sessionUser
    const isLoggedIn = !!user

    return (
        <section className="cta-section-modern">
            <div className="cta-decoration cta-decoration-1"></div>
            <div className="cta-decoration cta-decoration-2"></div>
            <div className="cta-container">
                <div className="cta-content">
                    <h2 className="cta-title">
                        {isLoggedIn 
                            ? "Sẵn sàng đặt lịch khám bệnh?" 
                            : "Sẵn sàng chăm sóc sức khỏe của bạn?"
                        }
                    </h2>
                    <p className="cta-description">
                        {isLoggedIn
                            ? "Khám phá các dịch vụ y tế chất lượng cao và đặt lịch hẹn với bác sĩ chuyên khoa ngay hôm nay"
                            : "Đăng ký ngay hôm nay để trải nghiệm dịch vụ đặt lịch khám bệnh tiện lợi và nhận nhiều ưu đãi hấp dẫn"
                        }
                    </p>
                    <div className="cta-buttons">
                        {!isLoggedIn && (
                            <Link to="/register" className="cta-button-primary">
                                Đăng ký ngay
                                <ArrowRight size={20} />
                            </Link>
                        )}
                        {isLoggedIn && (
                            <Link to="/home/specialty" className="cta-button-book">
                                <Calendar size={20} />
                                Đặt lịch ngay
                            </Link>
                        )}
                        <Link to="/home/doctorlist" className="cta-button-secondary">
                            <Stethoscope size={20} />
                            {isLoggedIn ? "Tìm bác sĩ" : "Tìm hiểu thêm"}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
