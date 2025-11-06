import { Clock, Shield, Users, Smartphone } from "lucide-react"
import "../../../../styles/FeaturesSection.css"

const features = [
    {
        icon: Clock,
        title: "Đặt lịch nhanh chóng",
        description: "Chỉ mất vài phút để đặt lịch khám với bác sĩ yêu thích của bạn",
    },
    {
        icon: Shield,
        title: "An toàn & bảo mật",
        description: "Thông tin cá nhân và y tế của bạn được bảo mật tuyệt đối",
    },
    {
        icon: Users,
        title: "Bác sĩ uy tín",
        description: "Hơn 5000+ bác sĩ chuyên khoa từ các bệnh viện hàng đầu",
    },
    {
        icon: Smartphone,
        title: "Tiện lợi mọi lúc",
        description: "Quản lý lịch khám và nhận thông báo ngay trên điện thoại",
    },
]

export function FeaturesSection() {
    return (
        <section className="features-section-modern">
            <div className="features-container">
                <div className="features-header">
                    <h2 className="features-title">Tại sao chọn chúng tôi?</h2>
                    <p className="features-subtitle">
                        Trải nghiệm đặt lịch khám bệnh hiện đại và tiện lợi
                    </p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon
                        return (
                            <div key={feature.title} className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <IconComponent size={28} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
