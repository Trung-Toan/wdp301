import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                <span className="text-xl font-bold text-primary-foreground">H+</span>
                            </div>
                            <span className="text-xl font-bold">HealthCare</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Nền tảng đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam, kết nối bạn với các bác sĩ và cơ sở y tế uy tín.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Dịch vụ</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Đặt lịch khám
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Tư vấn trực tuyến
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Xét nghiệm tại nhà
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Gói khám sức khỏe
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Hỗ trợ</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Câu hỏi thường gặp
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Hướng dẫn sử dụng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Chính sách bảo mật
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Điều khoản sử dụng
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold">Liên hệ</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Hotline: 1900 xxxx</li>
                            <li>Email: support@healthcare.vn</li>
                            <li>Địa chỉ: Hà Nội, Việt Nam</li>
                        </ul>
                        <div className="mt-4 flex gap-3">
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <Youtube className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>© 2025 HealthCare. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
