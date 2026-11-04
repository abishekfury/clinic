import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import AppointmentForm from "@/components/forms/AppointmentForm";

export const metadata: Metadata = {
  title: "Book Appointment | Lumina Dental",
  description: "Send us an appointment enquiry and our team will get in touch to confirm.",
};

export default function BookAppointmentPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section id="appointment" className="pt-32 pb-24 md:pt-40 md:pb-32 bg-warm-beige relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-5xl mx-auto bg-white rounded-[40px] shadow-2xl shadow-deep-navy/5 overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-5/12 bg-deep-navy p-10 md:p-14 text-soft-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-premium-teal/20 blur-[60px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-light mb-4">
                  Book an <span className="font-semibold italic text-premium-teal">appointment</span>
                </h1>
                <p className="text-soft-white/70 font-light">
                  Share a few details and your preferred time. Our team will contact you on WhatsApp or email to confirm.
                </p>
              </div>
            </div>

            <div className="w-full md:w-7/12 p-10 md:p-14 bg-white relative">
              <AppointmentForm />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
