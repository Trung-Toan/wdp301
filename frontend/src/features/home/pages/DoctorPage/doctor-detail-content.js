import {
    Star,
    Award,
    GraduationCap,
    Stethoscope,
    ChevronLeft,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import CardHeader from "../../../../components/ui/CardHeader";
import CardTitle from "../../../../components/ui/CardTitle";
import CardContent from "../../../../components/ui/CardContent";
import Tabs from "../../../../components/ui/Tabs";
import TabsList from "../../../../components/ui/TabsList";
import TabsTrigger from "../../../../components/ui/TabsTrigger";
import TabsContent from "../../../../components/ui/TabsContent";

import { DoctorBookingCalendar } from "../../components/DoctorBookingCalendar";
import { doctorApi } from "../../../../api";
import { Hospital } from "react-bootstrap-icons";

// ====== Mock Reviews (tạm thời nếu backend chưa trả reviews) ======
const mockReviews = [
    { id: 1, patientName: "Nguyễn Thị C", rating: 5, date: "15/12/2024", comment: "Bác sĩ tận tâm, khám kỹ càng và giải thích rõ ràng." },
    { id: 2, patientName: "Trần Văn D", rating: 5, date: "10/12/2024", comment: "Chuyên môn cao, thái độ thân thiện. Phòng khám sạch sẽ." },
    { id: 3, patientName: "Lê Thị E", rating: 4, date: "05/12/2024", comment: "Khám kỹ, nhưng thời gian chờ hơi lâu. Nhìn chung rất tốt." },
];

export function DoctorDetailContent({ doctorId }) {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctor = async () => {
            setLoading(true);
            try {
                const res = await doctorApi.getDoctorById(doctorId);
                console.log("Doctor in Doctor Details:", res.data);
                setDoctor(res.data || {}); // đảm bảo là object
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Lỗi khi tải bác sĩ");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    if (loading) return <p className="text-center py-10">Đang tải...</p>;
    if (error) return <p className="text-center py-10 text-red-500">{error}</p>;
    if (!doctor || Object.keys(doctor).length === 0) return <p className="text-center py-10">Bác sĩ không tồn tại</p>;

    return (
        <div className="bg-muted/30 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Back button */}
                <Link to="/home/doctorlist">
                    <Button variant="ghost" className="mb-6">
                        <ChevronLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
                    </Button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Doctor Info Card */}
                        <Card>
                            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                                <img
                                    src={doctor.data.avatar_url || "/placeholder.svg"}
                                    alt={doctor.data.name || "Doctor"}
                                    className="w-40 h-40 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <div>
                                        <h1 className="text-3xl font-bold mb-2">
                                            {doctor.data.title} - {doctor.data.name || "Không có tên"}
                                        </h1>

                                        <Badge variant="secondary" className="mb-3 flex items-center gap-1">
                                            <Stethoscope className="w-4 h-4 text-blue-600" /> {/* Icon chuyên khoa */}
                                            <strong>Chuyên Khoa: </strong>
                                            <span>{doctor.data.specialties?.[0]?.name || "Chưa có chuyên khoa"}</span>
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Hospital className="h-4 w-4" />{doctor.data.workplace || "Chưa có bệnh viện"}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <GraduationCap className="h-5 w-5 text-blue-600" />
                                            {doctor.data.degree || "Chưa có học vị"}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-bold text-lg">{doctor.data.rating || 0}</span>
                                        </div>
                                        {/* <div className="pt-2">
                                            <span className="text-sm text-muted-foreground">Giá khám: </span>
                                            <span className="text-xl font-bold text-primary">
                                                {doctor.data.pricing?.minFee
                                                    ? formatCurrency(doctor.data.pricing.minFee, doctor.data.pricing.currency)
                                                    : "Chưa có giá"}
                                            </span>

                                        </div> */}
                                    </div>
                                </div>
                            </CardContent>

                        </Card>

                        {/* Tabs */}
                        <Tabs defaultValue="about" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="about">Giới thiệu</TabsTrigger>
                                <TabsTrigger value="services">Dịch vụ</TabsTrigger>
                                <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                            </TabsList>

                            {/* About */}
                            <TabsContent value="about" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Stethoscope className="h-5 w-5" /> Về bác sĩ
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>{doctor.data.description || "Chưa có thông tin về bác sĩ."}</CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" /> Học vấn
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            <li className="flex gap-2">
                                                <span className="text-primary">•</span>{doctor.data.degree}
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" /> Chứng chỉ
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {(doctor.certifications || []).map((cert, idx) => (
                                                <li key={idx} className="flex gap-2">
                                                    <span className="text-primary">•</span>{cert}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Services */}
                            <TabsContent value="services">
                                <Card>
                                    <CardHeader><CardTitle>Dịch vụ khám chữa bệnh</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(doctor.services || []).map((service, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Stethoscope className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <span>{service}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Reviews */}
                            <TabsContent value="reviews">
                                <Card>
                                    <CardHeader><CardTitle>Đánh giá từ bệnh nhân</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {mockReviews.map((review) => (
                                                <div key={review.id} className="border-b pb-6 last:border-0">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-semibold">{review.patientName}</span>
                                                        <span className="text-sm text-muted-foreground">{review.date}</span>
                                                    </div>
                                                    <div className="flex gap-1 mb-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-muted-foreground">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar Booking */}
                    <DoctorBookingCalendar
                        doctor={doctor.data}
                        onSlotSelect={(slot) => {
                            // Thêm clinicId và specialtyId
                            const slotToSend = {
                                ...slot,
                                clinicId: slot.clinic?._id,
                                specialtyId: slot.specialty?._id,
                            };
                            Navigate("/booking", { state: { selectedSlot: slotToSend, doctorId: doctor.data._id } });
                        }}
                    />

                </div>
            </div>
        </div>
    );
}
