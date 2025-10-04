import { Link } from "react-router-dom";
import Card from "../../../../components/ui/Card";
import CardContent from "../../../../components/ui/CardContent";
import { Heart, Stethoscope, Brain, Baby, Eye, Bone, Activity, Pill } from "lucide-react"

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
        <section id="specialties" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl">Chuyên khoa nổi bật</h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Tìm bác sĩ chuyên khoa phù hợp với nhu cầu của bạn
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {specialties.map((specialty) => (
                        <Link to={`/home/specialty/detail/${specialty.slug}`} key={specialty.slug}>
                            <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <specialty.icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 font-semibold text-card-foreground">{specialty.name}</h3>
                                        <p className="text-sm text-muted-foreground">{specialty.count}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
