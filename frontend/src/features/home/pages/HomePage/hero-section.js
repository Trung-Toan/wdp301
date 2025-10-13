import React from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import LocationSelector from "../../components/LocationSelector";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 md:py-28">
            {/* Hiệu ứng background động */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.15),_transparent_50%)]"></div>

            <div className="container relative mx-auto px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl"
                >
                    Đặt lịch khám bệnh{" "}
                    <span className="text-blue-600">dễ dàng</span> và{" "}
                    <span className="text-cyan-600">nhanh chóng</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10 text-lg text-gray-600 md:text-xl"
                >
                    Kết nối với hàng nghìn bác sĩ chuyên khoa và cơ sở y tế uy tín trên toàn quốc.
                    Đặt lịch chỉ trong vài phút.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mx-auto w-full max-w-4xl rounded-2xl bg-white/70 p-6 shadow-2xl backdrop-blur-md md:p-8"
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Input
                                placeholder="Nhập Chuyên khoa..."
                                className="pl-10 bg-white/80 backdrop-blur-sm border-gray-300 focus:border-blue-500"
                            />
                        </div>

                        <LocationSelector onChange={(value) => console.log("Địa chỉ đã chọn:", value)} />

                        <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-md transition-all duration-200">
                            <Search className="mr-2 h-5 w-5" />
                            Tìm kiếm
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600"
                >
                    <span className="font-medium">Tìm kiếm phổ biến:</span>
                    {["Tim mạch", "Nha khoa", "Da liễu", "Sản phụ khoa"].map((item) => (
                        <Button
                            key={item}
                            variant="outline"
                            size="sm"
                            className="rounded-full border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition"
                        >
                            {item}
                        </Button>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
