import { useState } from "react"
import { Search, MapPin, Star, Clock, Filter, X } from "lucide-react"
import { Link } from "react-router-dom"
import Input from "../../../../components/ui/Input"
import Card from "../../../../components/ui/Card"
import CardContent from "../../../../components/ui/CardContent"
import Button from "../../../../components/ui/Button"
import Badge from "../../../../components/ui/Badge"

// Mock data
const mockDoctors = [
    { id: 1, name: "BS. Nguyễn Văn An", specialty: "Tim mạch", hospital: "Bệnh viện Đa khoa Trung ương", location: "Hà Nội", rating: 4.8, reviews: 156, experience: "15 năm kinh nghiệm", price: "500.000đ", image: "/doctor-portrait-male.jpg", available: true },
    { id: 2, name: "BS. Trần Thị Bình", specialty: "Da liễu", hospital: "Bệnh viện Da liễu Trung ương", location: "Hà Nội", rating: 4.9, reviews: 203, experience: "12 năm kinh nghiệm", price: "400.000đ", image: "/doctor-portrait-female.jpg", available: true },
    { id: 3, name: "BS. Lê Minh Cường", specialty: "Nhi khoa", hospital: "Bệnh viện Nhi Trung ương", location: "Hà Nội", rating: 4.7, reviews: 189, experience: "18 năm kinh nghiệm", price: "350.000đ", image: "/doctor-portrait-male-2.jpg", available: false },
    { id: 4, name: "BS. Phạm Thị Dung", specialty: "Sản phụ khoa", hospital: "Bệnh viện Phụ sản Hà Nội", location: "Hà Nội", rating: 4.9, reviews: 234, experience: "20 năm kinh nghiệm", price: "600.000đ", image: "/doctor-portrait-female-2.jpg", available: true },
    { id: 5, name: "BS. Hoàng Văn Em", specialty: "Tiêu hóa", hospital: "Bệnh viện Bạch Mai", location: "Hà Nội", rating: 4.6, reviews: 142, experience: "10 năm kinh nghiệm", price: "450.000đ", image: "/doctor-portrait-male-3.jpg", available: true },
    { id: 6, name: "BS. Đỗ Thị Phương", specialty: "Mắt", hospital: "Bệnh viện Mắt Trung ương", location: "Hà Nội", rating: 4.8, reviews: 178, experience: "14 năm kinh nghiệm", price: "400.000đ", image: "/doctor-portrait-female-3.jpg", available: true },
]

const specialties = ["Tất cả", "Tim mạch", "Da liễu", "Nhi khoa", "Sản phụ khoa", "Tiêu hóa", "Mắt", "Tai mũi họng"]
const locations = ["Tất cả", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"]

export function DoctorsListContent() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả")
    const [selectedLocation, setSelectedLocation] = useState("Tất cả")
    const [showFilters, setShowFilters] = useState(false)

    const filteredDoctors = mockDoctors.filter((doctor) => {
        const matchesSearch =
            doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSpecialty = selectedSpecialty === "Tất cả" || doctor.specialty === selectedSpecialty
        const matchesLocation = selectedLocation === "Tất cả" || doctor.location === selectedLocation
        return matchesSearch && matchesSpecialty && matchesLocation
    })

    return (
        <div className="bg-muted/30">
            {/* Search Header */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white mb-6 text-center">Tìm kiếm bác sĩ</h1>
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

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3 text-foreground">Chuyên khoa</h3>
                                    <div className="space-y-2">
                                        {specialties.map((specialty) => (
                                            <button
                                                key={specialty}
                                                onClick={() => setSelectedSpecialty(specialty)}
                                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedSpecialty === specialty ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}
                                            >
                                                {specialty}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-3 text-foreground">Địa điểm</h3>
                                    <div className="space-y-2">
                                        {locations.map((location) => (
                                            <button
                                                key={location}
                                                onClick={() => setSelectedLocation(location)}
                                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLocation === location ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}
                                            >
                                                {location}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filter */}
                        <div className="lg:hidden mb-4">
                            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="w-full">
                                <Filter className="h-4 w-4 mr-2" /> Bộ lọc
                            </Button>
                        </div>

                        {showFilters && (
                            <Card className="lg:hidden mb-6">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-foreground">Bộ lọc</h3>
                                        <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2 text-sm text-foreground">Chuyên khoa</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {specialties.map((specialty) => (
                                                    <Badge
                                                        key={specialty}
                                                        variant={selectedSpecialty === specialty ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => setSelectedSpecialty(specialty)}
                                                    >
                                                        {specialty}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2 text-sm text-foreground">Địa điểm</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {locations.map((location) => (
                                                    <Badge
                                                        key={location}
                                                        variant={selectedLocation === location ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => setSelectedLocation(location)}
                                                    >
                                                        {location}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Results */}
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
                                            {/* Image */}
                                            <div className="flex-shrink-0">
                                                <Link to={`/home/doctordetail/${doctor.id}`}>
                                                    <img
                                                        src={doctor.image || "/placeholder.svg"}
                                                        alt={doctor.name}
                                                        className="w-32 h-32 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    />
                                                </Link>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <Link to={`/home/doctordetail/${doctor.id}`}>
                                                            <h3 className="text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
                                                                {doctor.name}
                                                            </h3>
                                                        </Link>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Badge variant="secondary">{doctor.specialty}</Badge>
                                                                {doctor.available ? (
                                                                    <Badge className="bg-green-500 hover:bg-green-600">Còn lịch</Badge>
                                                                ) : (
                                                                    <Badge variant="outline">Hết lịch</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {doctor.hospital} - {doctor.location}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-4 w-4" />
                                                                {doctor.experience}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                    <span className="font-semibold text-foreground">{doctor.rating}</span>
                                                                </div>
                                                                <span className="text-sm text-muted-foreground">({doctor.reviews} đánh giá)</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price & Button */}
                                                    <div className="flex flex-col items-end gap-3">
                                                        <div className="text-right">
                                                            <p className="text-sm text-muted-foreground">Giá khám</p>
                                                            <p className="text-xl font-bold text-primary">{doctor.price}</p>
                                                        </div>
                                                        <Link to={`/home/doctordetail/${doctor.id}`} className="w-full md:w-auto">
                                                            <Button className="w-full" disabled={!doctor.available}>
                                                                {doctor.available ? "Đặt lịch khám" : "Hết lịch"}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredDoctors.length === 0 && (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <p className="text-muted-foreground">Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
