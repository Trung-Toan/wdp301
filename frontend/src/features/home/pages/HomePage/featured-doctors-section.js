import Card from "../../../../components/ui/Card"
import CardContent from "../../../../components/ui/Card"
import Button from "../../../../components/ui/Button"
import Badge from "../../../../components/ui/Badge"
import { Star, MapPin, Calendar } from "lucide-react"

const doctors = [
    {
        name: "BS. Nguyễn Văn An",
        specialty: "Tim mạch",
        hospital: "Bệnh viện Bạch Mai",
        rating: 4.9,
        reviews: 245,
        experience: "15 năm kinh nghiệm",
        image: "/doctor-portrait-male.jpg",
    },
    {
        name: "BS. Trần Thị Bình",
        specialty: "Sản phụ khoa",
        hospital: "Bệnh viện Phụ sản Hà Nội",
        rating: 4.8,
        reviews: 189,
        experience: "12 năm kinh nghiệm",
        image: "/doctor-portrait-female.jpg",
    },
    {
        name: "BS. Lê Minh Cường",
        specialty: "Ngoại khoa",
        hospital: "Bệnh viện Việt Đức",
        rating: 4.9,
        reviews: 312,
        experience: "18 năm kinh nghiệm",
        image: "/doctor-portrait-male-2.jpg",
    },
    {
        name: "BS. Phạm Thu Hà",
        specialty: "Da liễu",
        hospital: "Bệnh viện Da liễu TW",
        rating: 4.7,
        reviews: 156,
        experience: "10 năm kinh nghiệm",
        image: "/doctor-portrait-female-2.jpg",
    },
]

export function FeaturedDoctorsSection() {
    return (
        <section id="doctors" className="bg-muted/30 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl">Bác sĩ nổi bật</h2>
                    <p className="text-lg text-muted-foreground text-pretty">Đội ngũ bác sĩ giàu kinh nghiệm và tận tâm</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {doctors.map((doctor) => (
                        <Card key={doctor.name} className="group overflow-hidden transition-all hover:shadow-lg">
                            <div className="aspect-square overflow-hidden">
                                <img
                                    src={doctor.image || "/placeholder.svg"}
                                    alt={doctor.name}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                            <CardContent className="p-4">
                                <div className="mb-2">
                                    <h3 className="font-semibold text-card-foreground">{doctor.name}</h3>
                                    <Badge variant="secondary" className="mt-1">
                                        {doctor.specialty}
                                    </Badge>
                                </div>

                                <div className="mb-3 flex items-center gap-1 text-sm">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{doctor.rating}</span>
                                    <span className="text-muted-foreground">({doctor.reviews} đánh giá)</span>
                                </div>

                                <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span className="line-clamp-1">{doctor.hospital}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{doctor.experience}</span>
                                    </div>
                                </div>

                                <Button className="w-full bg-transparent" variant="outline">
                                    Đặt lịch khám
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button size="lg" variant="outline">
                        Xem tất cả bác sĩ
                    </Button>
                </div>
            </div>
        </section>
    )
}
