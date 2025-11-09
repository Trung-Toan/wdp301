import CTASection from "./cta-section";
import { FeaturedDoctorsSection } from "./featured-doctors-section";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { SpecialtiesSection } from "./specialties-section";
import FirstTimeGuide from "../../../../components/FirstTimeGuide";



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
            <FirstTimeGuide page="home" />
        </div>
    )
}
