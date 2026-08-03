import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TemplateShowcase } from "@/components/landing/TemplateShowcase";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TemplateShowcase />
        <FeatureSection />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
