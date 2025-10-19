// import { Card, CardContent } from "@/components/ui/card"
// import { Clock, Shield, Users, Smartphone } from "lucide-react"

// const features = [
//   {
//     icon: Clock,
//     title: "Đặt lịch nhanh chóng",
//     description: "Chỉ mất vài phút để đặt lịch khám với bác sĩ yêu thích của bạn",
//   },
//   {
//     icon: Shield,
//     title: "An toàn & bảo mật",
//     description: "Thông tin cá nhân và y tế của bạn được bảo mật tuyệt đối",
//   },
//   {
//     icon: Users,
//     title: "Bác sĩ uy tín",
//     description: "Hơn 5000+ bác sĩ chuyên khoa từ các bệnh viện hàng đầu",
//   },
//   {
//     icon: Smartphone,
//     title: "Tiện lợi mọi lúc",
//     description: "Quản lý lịch khám và nhận thông báo ngay trên điện thoại",
//   },
// ]

// export function FeaturesSection() {
//   return (
//     <section className="py-16 md:py-24">
//       <div className="container mx-auto px-4">
//         <div className="mb-12 text-center">
//           <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl">Tại sao chọn chúng tôi?</h2>
//           <p className="text-lg text-muted-foreground text-pretty">
//             Trải nghiệm đặt lịch khám bệnh hiện đại và tiện lợi
//           </p>
//         </div>

//         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
//           {features.map((feature) => (
//             <Card key={feature.title} className="border-none bg-gradient-to-br from-card to-muted/20">
//               <CardContent className="p-6">
//                 <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//                   <feature.icon className="h-6 w-6" />
//                 </div>
//                 <h3 className="mb-2 font-semibold text-card-foreground">{feature.title}</h3>
//                 <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }
