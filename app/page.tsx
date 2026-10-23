import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/sections/Hero";
import Trust from "@/components/sections/Trust";
import Services from "@/components/sections/Services";
import Storytelling from "@/components/sections/Storytelling";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Doctor from "@/components/sections/Doctor";
import Testimonials from "@/components/sections/Testimonials";
import Appointment from "@/components/sections/Appointment";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <Trust />
      <Services />
      <Storytelling />
      <BeforeAfter />
      <Doctor />
      <Testimonials />
      <Appointment />
      <Footer />
    </main>
  );
}
