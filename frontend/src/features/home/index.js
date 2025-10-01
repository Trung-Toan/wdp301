import { CTASection } from "./pages/cta-section";
import { FeaturedDoctorsSection } from "./pages/featured-doctors-section";
import { FeaturesSection } from "./pages/features-section";
import { HeroSection } from "./pages/hero-section";
import { SpecialtiesSection } from "./pages/specialties-section";


export default function HomePage() {
    return (
        <div className="min-h-screen">
            <main>
                <HeroSection />
                <SpecialtiesSection />
                <FeaturedDoctorsSection />
                <FeaturesSection />
                <CTASection />
            </main>
        </div>
    )
}
