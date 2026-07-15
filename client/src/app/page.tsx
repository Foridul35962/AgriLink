import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Roles from "@/components/home/Roles";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Roles />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
