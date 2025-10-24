import {
    Star,
    Award,
    GraduationCap,
    Stethoscope,
    ChevronLeft,
    MapPin
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

export function DoctorDetailContent({ doctorId }) {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctor = async () => {
            setLoading(true);
            try {
                const res = await doctorApi.getDoctorById(doctorId);
                console.log("Doctor in Doctor Details:", res.data);
                setDoctor(res.data || {});
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

    const d = doctor.data;

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
                                    src={d.avatar_url || "/placeholder.svg"}
                                    alt={d.name || "Doctor"}
                                    className="w-40 h-40 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold mb-2">
                                        {d.title} - {d.name || "Không có tên"}
                                    </h1>

                                    <Badge variant="secondary" className="mb-3 flex items-center gap-1">
                                        <Stethoscope className="w-4 h-4 text-blue-600" />
                                        <strong>Chuyên Khoa: </strong>
                                        <span>{d.specialties?.[0]?.name || "Chưa có chuyên khoa"}</span>
                                    </Badge>

                                    <div className="space-y-3 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Hospital className="h-4 w-4 text-blue-500" />
                                            <span>{d.clinic?.name || "Chưa có bệnh viện"}</span>
                                        </div>

                                        {d.clinic?.address && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-red-500" />
                                                <span>
                                                    {`${d.clinic.houseNumber ? d.clinic.houseNumber + " " : ""}${d.clinic.street ? d.clinic.street + ", " : ""}${d.clinic.ward || ""}${d.clinic.province ? ", " + d.clinic.province : ""}`}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-blue-600" />
                                            {d.degree || "Chưa có học vị"}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-bold text-lg">{d.rating?.average?.toFixed(1) || 0}</span>
                                            <span className="text-sm text-gray-500">
                                                ({d.rating?.total || 0} đánh giá)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs */}
                        <Tabs defaultValue="about" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="about">Giới thiệu</TabsTrigger>
                                <TabsTrigger value="licenses">Chứng chỉ</TabsTrigger>
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
                                    <CardContent>
                                        {d.description || "Chưa có thông tin về bác sĩ."}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" /> Kinh nghiệm
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {d.experience || "Chưa cập nhật kinh nghiệm"}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Licenses */}
                            <TabsContent value="licenses">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" /> Chứng chỉ hành nghề
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {d.licenses?.length > 0 ? (
                                            <ul className="space-y-4">
                                                {d.licenses.map((l) => (
                                                    <li key={l.id} className="border p-3 rounded-md bg-muted/40">
                                                        <p><strong>Số chứng chỉ:</strong> {l.licenseNumber}</p>
                                                        <p><strong>Cấp bởi:</strong> {l.issued_by}</p>
                                                        <p><strong>Hiệu lực:</strong> {new Date(l.issued_date).toLocaleDateString()} - {new Date(l.expiry_date).toLocaleDateString()}</p>
                                                        <p><strong>Trạng thái:</strong> {l.status}</p>
                                                        {l.document_url?.length > 0 && (
                                                            <a href={l.document_url[0]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                                Xem tài liệu
                                                            </a>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>Chưa có chứng chỉ.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Reviews */}
                            <TabsContent value="reviews">
                                <Card>
                                    <CardHeader><CardTitle>Đánh giá từ bệnh nhân</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {d.feedbacks?.length > 0 ? (
                                                d.feedbacks.map((fb) => (
                                                    <div key={fb.id} className="border-b pb-6 last:border-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <img
                                                                src={fb.patient?.avatar_url || "/default-avatar.png"}
                                                                alt={fb.patient?.full_name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                            <span className="font-semibold">{fb.patient?.full_name}</span>
                                                        </div>

                                                        <div className="flex gap-1 mb-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < fb.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-muted-foreground">{fb.comment}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>Chưa có đánh giá nào.</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar Booking */}
                    <DoctorBookingCalendar
                        doctor={d}
                        onSlotSelect={(slot) => {
                            const slotToSend = {
                                ...slot,
                                clinicId: slot.clinic?._id,
                                specialtyId: slot.specialty?._id,
                            };
                            navigate("/booking", { state: { selectedSlot: slotToSend, doctorId: d.id } });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
