import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "../../../../components/ui/Card";
import CardContent from "../../../../components/ui/CardContent";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { Star, MapPin, Calendar } from "lucide-react";
import { doctorApi } from "../../../../api";

export function FeaturedDoctorsSection() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const res = await doctorApi.getDoctorTop(4);
                setDoctors(res.data.data || []);
            } catch (err) {
                console.error("Lỗi khi lấy bác sĩ top:", err);
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    return (
        <section id="doctors" className="relative py-16 md:py-24 bg-gradient-to-b from-blue-50 via-white to-cyan-50 overflow-hidden">
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
                                <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-md shadow-md transition-transform hover:-translate-y-2 hover:shadow-2xl">
                                    <div className="aspect-square h-48 overflow-hidden rounded-t-2xl">
                                        <img
                                            src={doctor.avatar_url || "/placeholder.svg"}
                                            alt={doctor.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>

                                    <CardContent className="p-5">
                                        <div className="mb-2">
                                            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                                                {doctor.title}
                                            </h3>
                                            {doctor.specialties && doctor.specialties.length > 0 && (
                                                <Badge className="mt-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-white">
                                                    {doctor.specialties.map(s => s.name).join(", ")}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="mb-3 flex items-center gap-1 text-sm">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{doctor.rating || "-"}</span>
                                        </div>

                                        <div className="mb-3 space-y-1 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span className="line-clamp-1">{doctor.clinic?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{doctor.degree}</span>
                                            </div>
                                        </div>

                                        <Button className="w-full mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-md transition-all duration-200">
                                            Đặt lịch khám
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Button size="lg" variant="outline">
                        Xem tất cả bác sĩ
                    </Button>
                </div>
            </div>
        </section>
    );
}
