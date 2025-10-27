import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Card from "../../../../components/ui/Card";
import CardContent from "../../../../components/ui/CardContent";
import Button from "../../../../components/ui/Button";
import { specialtyApi } from "../../../../api";

export function SpecialtiesSection() {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const displayLimit = 8; // Chỉ hiển thị 8 chuyên khoa đầu tiên

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await specialtyApi.getAll();
                if (res.data.success) {
                    setSpecialties(res.data.data || []);
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh sách chuyên khoa:", err);
                setSpecialties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecialties();
    }, []);

    // Lấy 8 chuyên khoa đầu tiên để hiển thị
    const displayedSpecialties = specialties.slice(0, displayLimit);

    // Function để render icon từ icon_url hoặc mặc định
    const renderIcon = (iconUrl) => {
        if (iconUrl) {
            return <img src={iconUrl} alt="" className="h-9 w-9" />;
        }
        // Icon mặc định nếu không có icon_url
        return (
            <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        );
    };

    if (loading) {
        return (
            <section id="specialties" className="relative py-20 md:py-28 bg-gradient-to-b from-blue-50 via-white to-cyan-50 overflow-hidden">
                <div className="container relative mx-auto px-6">
                    <div className="text-center">
                        <p className="text-gray-500">Đang tải chuyên khoa...</p>
                    </div>
                </div>
            </section>
        );
    }

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
                        Các chuyên khoa
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Tìm bác sĩ chuyên khoa phù hợp với nhu cầu của bạn
                    </p>
                </motion.div>

                {/* Lưới chuyên khoa */}
                {displayedSpecialties.length > 0 ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            {displayedSpecialties.map((specialty, i) => (
                                <motion.div
                                    key={specialty.id || specialty._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                >
                                    <Link to={`/home/specialty/detail/${specialty.id || specialty._id}`}>
                                        <Card className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-md shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                                                {/* Icon */}
                                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 text-blue-600 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:text-white group-hover:shadow-lg">
                                                    {renderIcon(specialty.icon_url)}
                                                    <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 blur-md transition" />
                                                </div>

                                                {/* Tên chuyên khoa */}
                                                <div>
                                                    <h3 className="mb-1 text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                                                        {specialty.name}
                                                    </h3>
                                                    {specialty.description && (
                                                        <p className="text-sm text-gray-500 line-clamp-2">
                                                            {specialty.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Nút Xem tất cả - chỉ hiển thị khi có hơn 8 chuyên khoa */}
                        {specialties.length > displayLimit && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                viewport={{ once: true }}
                                className="mt-12 text-center"
                            >
                                <Link to="/home/specialty">
                                    <Button size="lg" variant="outline">
                                        Xem tất cả
                                    </Button>
                                </Link>
                            </motion.div>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-500">Không có chuyên khoa nào</p>
                    </div>
                )}
            </div>
        </section>
    );
}
