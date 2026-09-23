import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Roles from "@/components/home/Roles";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <main className="bg-white">
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Roles />
      <Testimonials />
      <CTA />
    </main>
  );
}
