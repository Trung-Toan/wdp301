import { useState } from "react";
import {
    Star,
    MapPin,
    Clock,
    Award,
    GraduationCap,
    Stethoscope,
    Calendar,
    ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
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

// ====== Mock Data ======
const mockDoctorDetails = {
    "1": {
        id: 1,
        name: "BS. Nguyễn Văn An",
        specialty: "Tim mạch",
        hospital: "Bệnh viện Đa khoa Trung ương",
        location: "Hà Nội",
        rating: 4.8,
        reviews: 156,
        experience: "15 năm kinh nghiệm",
        price: "500.000đ",
        image: "/doctor-portrait-male.jpg",
        available: true,
        education: [
            "Bác sĩ Đa khoa - Đại học Y Hà Nội (2005)",
            "Thạc sĩ Tim mạch - Đại học Y Hà Nội (2010)",
            "Chứng chỉ Tim mạch can thiệp - Bệnh viện Chợ Rẫy (2012)",
        ],
        certifications: [
            "Chứng chỉ hành nghề số 12345",
            "Chứng chỉ Tim mạch can thiệp",
            "Chứng chỉ Siêu âm tim",
        ],
        about:
            "Bác sĩ Nguyễn Văn An có hơn 15 năm kinh nghiệm trong lĩnh vực tim mạch. Chuyên điều trị các bệnh lý về tim mạch, tăng huyết áp, rối loạn nhịp tim.",
        services: [
            "Khám và tư vấn bệnh tim mạch",
            "Siêu âm tim",
            "Điện tâm đồ",
            "Holter huyết áp 24h",
            "Can thiệp tim mạch",
        ],
        schedule: [
            { day: "Thứ 2", slots: ["08:00", "09:00", "10:00", "14:00", "15:00"] },
            { day: "Thứ 3", slots: ["08:00", "09:00", "10:00", "14:00", "15:00"] },
            { day: "Thứ 4", slots: ["08:00", "09:00", "10:00"] },
            { day: "Thứ 5", slots: ["08:00", "09:00", "10:00", "14:00", "15:00"] },
            { day: "Thứ 6", slots: ["08:00", "09:00", "10:00", "14:00", "15:00"] },
            { day: "Thứ 7", slots: ["08:00", "09:00", "10:00"] },
        ],
    },
    "2": {
        id: 2,
        name: "BS. Trần Thị Bình",
        specialty: "Da liễu",
        hospital: "Bệnh viện Da liễu Trung ương",
        location: "Hà Nội",
        rating: 4.9,
        reviews: 203,
        experience: "12 năm kinh nghiệm",
        price: "400.000đ",
        image: "/doctor-portrait-female.jpg",
        available: true,
        education: [
            "Bác sĩ Đa khoa - Đại học Y Dược TP.HCM (2008)",
            "Chuyên khoa I Da liễu - Đại học Y Dược TP.HCM (2012)",
        ],
        certifications: [
            "Chứng chỉ hành nghề số 23456",
            "Chứng chỉ Laser điều trị da",
            "Chứng chỉ Thẩm mỹ da",
        ],
        about:
            "Bác sĩ Trần Thị Bình chuyên điều trị các bệnh lý về da, mụn trứng cá, nám da, viêm da. Có kinh nghiệm trong điều trị bằng laser và thẩm mỹ da hiện đại.",
        services: ["Khám và điều trị bệnh da", "Điều trị mụn", "Điều trị nám", "Laser điều trị", "Thẩm mỹ da"],
        schedule: [
            { day: "Thứ 2", slots: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"] },
            { day: "Thứ 3", slots: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"] },
            { day: "Thứ 4", slots: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"] },
            { day: "Thứ 5", slots: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"] },
            { day: "Thứ 6", slots: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"] },
        ],
    },
};

const mockReviews = [
    { id: 1, patientName: "Nguyễn Thị C", rating: 5, date: "15/12/2024", comment: "Bác sĩ tận tâm, khám kỹ càng và giải thích rõ ràng." },
    { id: 2, patientName: "Trần Văn D", rating: 5, date: "10/12/2024", comment: "Chuyên môn cao, thái độ thân thiện. Phòng khám sạch sẽ." },
    { id: 3, patientName: "Lê Thị E", rating: 4, date: "05/12/2024", comment: "Khám kỹ, nhưng thời gian chờ hơi lâu. Nhìn chung rất tốt." },
];

// ====== Component JS ======
export function DoctorDetailContent({ doctorId }) {
    const [selectedDay, setSelectedDay] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const doctor = mockDoctorDetails[doctorId] || mockDoctorDetails["1"];

    return (
        <div className="bg-muted/30 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <Link to="/doctors">
                    <Button variant="ghost" className="mb-6">
                        <ChevronLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
                    </Button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Doctor Info */}
                        <Card>
                            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                                <img src={doctor.image || "/placeholder.svg"} alt={doctor.name} className="w-40 h-40 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
                                            <Badge variant="secondary" className="mb-3">{doctor.specialty}</Badge>
                                        </div>
                                        {doctor.available && <Badge className="bg-green-500">Còn lịch</Badge>}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-5 w-5" /> {doctor.hospital} - {doctor.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-5 w-5" /> {doctor.experience}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-bold text-lg">{doctor.rating}</span>
                                            <span className="text-muted-foreground">({doctor.reviews} đánh giá)</span>
                                        </div>
                                        <div className="pt-2">
                                            <span className="text-sm text-muted-foreground">Giá khám: </span>
                                            <span className="text-2xl font-bold text-primary">{doctor.price}</span>
                                        </div>
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
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5" /> Về bác sĩ</CardTitle></CardHeader>
                                    <CardContent>{doctor.about}</CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Học vấn</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">{doctor.education.map((edu, idx) => (<li key={idx} className="flex gap-2"><span className="text-primary">•</span>{edu}</li>))}</ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Chứng chỉ</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">{doctor.certifications.map((cert, idx) => (<li key={idx} className="flex gap-2"><span className="text-primary">•</span>{cert}</li>))}</ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Services */}
                            <TabsContent value="services">
                                <Card>
                                    <CardHeader><CardTitle>Dịch vụ khám chữa bệnh</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {doctor.services.map((service, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Stethoscope className="h-5 w-5 text-primary" /></div>
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
                                                        {[...Array(5)].map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />))}
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
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Đặt lịch khám</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-3">Chọn ngày khám</h4>
                                    <div className="space-y-2">
                                        {doctor.schedule.map((s, idx) => (
                                            <button key={idx} onClick={() => { setSelectedDay(idx); setSelectedSlot(null); }}
                                                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${selectedDay === idx ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                                                <div className="font-medium">{s.day}</div>
                                                <div className="text-sm text-muted-foreground">{s.slots.length} khung giờ</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">Chọn giờ khám</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {doctor.schedule[selectedDay]?.slots.map((slot) => (
                                            <button key={slot} onClick={() => setSelectedSlot(slot)}
                                                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${selectedSlot === slot ? "border-primary bg-primary text-white" : "border-border hover:border-primary/50"}`}>
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between mb-4">
                                        <span className="text-muted-foreground">Giá khám:</span>
                                        <span className="text-xl font-bold text-primary">{doctor.price}</span>
                                    </div>
                                    <Button className="w-full" size="lg" disabled={!selectedSlot || !doctor.available}>
                                        {selectedSlot ? "Xác nhận đặt lịch" : "Chọn giờ khám"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
