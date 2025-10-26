import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../../../components/ui/Card";
import CardContent from "../../../../components/ui/CardContent";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { Star, MapPin, Calendar } from "lucide-react";
import { doctorApi } from "../../../../api";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";

export function FeaturedDoctorsSection() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const isLoggedIn = !!token;
    console.log("isLoggedIn: ", isLoggedIn);
    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const limit = 4;
                let res;
                if (isLoggedIn) {
                    // Nếu đã đăng nhập => gọi API top gần vị trí người dùng
                    res = await doctorApi.getDoctorTopNearMe(limit);
                } else {
                    // Nếu chưa đăng nhập => gọi API top toàn hệ thống
                    res = await doctorApi.getDoctorTop(limit);
                }
                console.log("doctor list: ", res.data);
                setDoctors(res.data.data || []);
            } catch (err) {
                console.error("Lỗi khi lấy bác sĩ top:", err);
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [isLoggedIn]);

    return (
        <section
            id="doctors"
            className="relative py-16 md:py-24 bg-gradient-to-b from-blue-50 via-white to-cyan-50 overflow-hidden"
        >
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl"
                    >
                        Bác sĩ nổi bật
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        Đội ngũ bác sĩ giàu kinh nghiệm và tận tâm
                    </motion.p>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Đang tải bác sĩ...</p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {doctors.map((doctor, i) => (
                            <motion.div
                                key={doctor._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-md shadow-md transition-transform hover:-translate-y-2 hover:shadow-2xl min-h-[480px] flex flex-col">
                                    <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden rounded-t-2xl flex-shrink-0">
                                        <img
                                            src={doctor.avatar_url || "/placeholder.svg"}
                                            alt={doctor.full_name}
                                            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                    </div>

                                    <CardContent className="p-5 flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 group-hover:text-blue-600 break-words">
                                                <Link to={`/home/doctordetail/${doctor._id}`}>
                                                    {(doctor.title || "") + " - " + (doctor.full_name || "Chưa có tên bác sĩ")}
                                                </Link>
                                            </h3>

                                            {doctor.specialties?.length > 0 ? (
                                                <Badge className="mt-2 inline-block bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-2 py-1 text-xs sm:text-sm rounded-lg break-words">
                                                    {doctor.specialties.map((s) => s.name).join(", ")}
                                                </Badge>
                                            ) : (
                                                <Badge className="mt-2 inline-block bg-gray-200 text-gray-600 px-2 py-1 text-xs sm:text-sm rounded-lg">
                                                    Chưa có chuyên khoa
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="mt-3 flex items-center gap-1 text-sm">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{doctor.rating || "-"}</span>
                                        </div>

                                        <div className="mt-3 space-y-1 text-sm text-gray-500">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 mt-1" />
                                                <span className="break-words">{doctor.clinic?.name || "Chưa có phòng khám"}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 mt-1" />
                                                <span className="break-words">{doctor.degree || "Chưa có bằng cấp"}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Button size="lg" variant="outline">
                        <Link to="/home/doctorlist">Xem tất cả bác sĩ</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
