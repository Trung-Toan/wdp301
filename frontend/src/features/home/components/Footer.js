import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Logo + Description */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                <span className="text-xl font-bold text-primary-foreground">M+</span>
                            </div>
                            <span className="text-xl font-bold">MediSched</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Nền tảng đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam, kết nối bạn với các bác sĩ và cơ sở y tế uy tín.
                        </p>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-4 font-semibold">Dịch vụ</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Đặt lịch khám
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Tư vấn trực tuyến
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Xét nghiệm tại nhà
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Gói khám sức khỏe
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="mb-4 font-semibold">Hỗ trợ</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Câu hỏi thường gặp
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Hướng dẫn sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary transition-colors">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact + Socials */}
                    <div>
                        <h3 className="mb-4 font-semibold">Liên hệ</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Hotline: 1900 xxxx</li>
                            <li>Email: support@medisched.vn</li>
                            <li>Địa chỉ: Hà Nội, Việt Nam</li>
                        </ul>

                        <div className="mt-4 flex gap-3">
                            <Link to="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <Facebook className="h-4 w-4" />
                            </Link>
                            <Link to="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <Twitter className="h-4 w-4" />
                            </Link>
                            <Link to="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <Instagram className="h-4 w-4" />
                            </Link>
                            <Link to="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                <Youtube className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>© 2025 MediSched. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
