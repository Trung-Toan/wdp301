import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../../../../components/ui/Card";
import CardContent from "../../../../components/ui/CardContent";
import { Heart, Stethoscope, Brain, Baby, Eye, Bone, Activity, Pill } from "lucide-react";

const specialties = [
    { icon: Heart, name: "Tim mạch", slug: "tim-mach", count: "120+ bác sĩ" },
    { icon: Stethoscope, name: "Nội khoa", slug: "noi-khoa", count: "200+ bác sĩ" },
    { icon: Brain, name: "Thần kinh", slug: "than-kinh", count: "85+ bác sĩ" },
    { icon: Baby, name: "Sản phụ khoa", slug: "san-phu-khoa", count: "150+ bác sĩ" },
    { icon: Eye, name: "Mắt", slug: "mat", count: "95+ bác sĩ" },
    { icon: Bone, name: "Xương khớp", slug: "xuong-khop", count: "110+ bác sĩ" },
    { icon: Activity, name: "Ngoại khoa", slug: "ngoai-khoa", count: "130+ bác sĩ" },
    { icon: Pill, name: "Da liễu", slug: "da-lieu", count: "75+ bác sĩ" },
];

export function SpecialtiesSection() {
    return (
        <section id="specialties" className="relative py-20 md:py-28 bg-gradient-to-b from-blue-50 via-white to-cyan-50 overflow-hidden">
            {/* Hiệu ứng background mềm */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(56,189,248,0.1),_transparent_50%)]"></div>

            <div className="container relative mx-auto px-6">
                {/* Tiêu đề */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-14 text-center"
                >
                    <h2 className="mb-3 text-4xl font-bold tracking-tight text-gray-800 md:text-5xl">
                        Chuyên khoa nổi bật
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Tìm bác sĩ chuyên khoa phù hợp với nhu cầu của bạn
                    </p>
                </motion.div>

                {/* Lưới chuyên khoa */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {specialties.map((specialty, i) => (
                        <motion.div
                            key={specialty.slug}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <Link to={`/home/specialty/detail/${specialty.slug}`}>
                                <Card className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-md shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                    <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                                        {/* Icon */}
                                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 text-blue-600 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:text-white group-hover:shadow-lg">
                                            <specialty.icon className="h-9 w-9 transition-transform duration-300 group-hover:scale-110" />
                                            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 blur-md transition" />
                                        </div>

                                        {/* Tên chuyên khoa */}
                                        <div>
                                            <h3 className="mb-1 text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                                                {specialty.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">{specialty.count}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
