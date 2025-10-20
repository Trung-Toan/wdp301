import { useEffect, useState } from "react";
import { Search, MapPin, Star, Hospital, Award } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../../../../components/ui/Input";
import Card from "../../../../components/ui/Card";
import CardContent from "../../../../components/ui/CardContent";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { doctorApi, specialtyApi, provinceApi } from "../../../../api";

export function DoctorsListContent() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả");
    const [selectedProvince, setSelectedProvince] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState(["Tất cả"]);
    const [provinces, setProvinces] = useState([]);

    // Lấy danh sách chuyên khoa
    useEffect(() => {
        async function fetchSpecialties() {
            try {
                const res = await specialtyApi.getAll();
                const specList = res.data?.data?.map((s) => s.name) || [];
                setSpecialties(["Tất cả", ...specList]);
            } catch (err) {
                console.error("Lỗi khi tải chuyên khoa:", err);
            }
        }
        fetchSpecialties();
    }, []);

    // Lấy danh sách tỉnh
    useEffect(() => {
        async function fetchProvinces() {
            try {
                const res = await provinceApi.getProvinces();
                if (res.data.success) setProvinces(res.data.options || []);
            } catch (err) {
                console.error("Lỗi khi tải tỉnh:", err);
            }
        }
        fetchProvinces();
    }, []);

    //  Lấy danh sách bác sĩ
    useEffect(() => {
        async function fetchDoctors() {
            try {
                const res = await doctorApi.getDoctorTop({ limit: 0 });
                const apiDoctors = res.data?.data || [];
                console.log("apiDoctors: ", apiDoctors);
                const mapped = apiDoctors.map((d) => {
                    const addr = d.clinic?.address;
                    let location = "Chưa rõ địa chỉ";
                    let provinceName = "";

                    if (addr) {
                        provinceName = typeof addr.province === "object" ? addr.province.name : addr.province;
                        const districtName = typeof addr.district === "object" ? addr.district.name : addr.district;
                        const wardName = typeof addr.ward === "object" ? addr.ward.name : addr.ward;

                        location = [addr.houseNumber, addr.street, wardName, districtName, provinceName]
                            .filter(Boolean)
                            .join(", ");
                    }

                    return {
                        id: d._id,
                        title: d.title || "Chưa cập nhật",
                        fullname: d.full_name || "Không có tên",
                        specialty: d.specialties?.[0]?.name || "Không có chuyên khoa",
                        hospital: d.clinic?.name || "Không có phòng khám",
                        location,
                        provinceName,
                        rating: d.rating || 0,
                        experience: "Đang cập nhật",
                        price: "Đang cập nhật",
                        image: d.avatar_url || "/placeholder.svg",
                        available: true,
                        reviews: 0,
                    };
                });
                console.log("dữ liệu về bác sĩ : ", mapped);
                setDoctors(mapped);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách bác sĩ:", err);
            }
        }
        fetchDoctors();
    }, []);

    // Lọc bác sĩ
    const filteredDoctors = doctors.filter((doctor) => {
        const matchesSearch =
            doctor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpecialty =
            selectedSpecialty === "Tất cả" || doctor.specialty === selectedSpecialty;

        const matchesProvince =
            !selectedProvince || doctor.provinceName === selectedProvince;

        return matchesSearch && matchesSpecialty && matchesProvince;
    });

    return (
        <div className="bg-muted/30">
            {/* 🔍 Thanh tìm kiếm */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white mb-6 text-center">
                        Tìm kiếm bác sĩ
                    </h1>
                    <div className="max-w-3xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Tìm theo tên bác sĩ, chuyên khoa, bệnh viện..."
                            className="pl-12 pr-4 h-14 text-base bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ⚙️ Bộ lọc và kết quả */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar bộ lọc */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                {/* Chuyên khoa */}
                                <div>
                                    <h3 className="font-semibold mb-3 text-foreground">Chuyên khoa</h3>
                                    <div className="space-y-2">
                                        {specialties.map((specialty) => (
                                            <button
                                                key={specialty}
                                                onClick={() => setSelectedSpecialty(specialty)}
                                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedSpecialty === specialty
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted text-foreground"
                                                    }`}
                                            >
                                                {specialty}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tỉnh */}
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-3 text-foreground">Tỉnh/Thành phố</h3>
                                    <select
                                        value={selectedProvince}
                                        onChange={(e) => setSelectedProvince(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:border-primary focus:outline-none"
                                    >
                                        <option value="">-- Tất cả --</option>
                                        {provinces.map((p) => (
                                            <option key={p.value} value={p.label}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Danh sách bác sĩ */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <p className="text-muted-foreground">
                                Tìm thấy <span className="font-semibold text-foreground">{filteredDoctors.length}</span> bác sĩ
                            </p>
                        </div>

                        <div className="space-y-4">
                            {filteredDoctors.map((doctor) => (
                                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-shrink-0">
                                                <Link to={`/home/doctordetail/${doctor.id}`}>
                                                    <img
                                                        src={doctor.image}
                                                        alt={doctor.name}
                                                        className="w-32 h-32 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    />
                                                </Link>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-foreground mb-2">
                                                    {doctor.title} - {doctor.fullname}
                                                </h3>

                                                <div className="flex items-center gap-2 text-sm mb-2">
                                                    <Badge variant="secondary">{doctor.specialty}</Badge>
                                                    <Badge className="bg-green-500 hover:bg-green-600">Còn lịch</Badge>
                                                </div>

                                                {/* Hospital & Location tách 2 dòng */}
                                                <div className="text-sm text-muted-foreground space-y-1 mb-1">
                                                    <p className="flex items-center gap-1">
                                                        <Hospital className="h-4 w-4" />
                                                        <span>{doctor.hospital || "Chưa có phòng khám"}</span>
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{doctor.location || "Chưa có địa chỉ"}</span>
                                                    </p>
                                                </div>

                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                                                    <Award className="h-4 w-4" /> {doctor.experience}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold">{doctor.rating}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        ({doctor.reviews} đánh giá)
                                                    </span>
                                                </div>
                                            </div>


                                            <div className="flex flex-col items-end justify-between">
                                                <Link to={`/home/doctordetail/${doctor.id}`}>
                                                    <Button>Đặt lịch khám</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredDoctors.length === 0 && (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <p className="text-muted-foreground">
                                            Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
