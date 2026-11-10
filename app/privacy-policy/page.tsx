import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Lumina Dental",
  description: "How we handle the details you share when you send an appointment enquiry.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-warm-beige">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-2xl shadow-deep-navy/5 p-10 md:p-14">
            <h1 className="text-3xl md:text-4xl font-light mb-6">
              Privacy <span className="font-semibold italic text-premium-teal">Policy</span>
            </h1>
            <p className="text-deep-navy/70 font-light mb-4">
              This is a placeholder page. The clinic&apos;s full privacy policy will be published here.
            </p>
            <p className="text-deep-navy/70 font-light mb-4">
              When you send an appointment enquiry we collect your name, phone number, email address, the treatment you are
              interested in and your preferred appointment time. We use these details only to contact you about your enquiry.
            </p>
            <div className="mb-4 p-4 rounded-2xl bg-warm-beige border border-deep-navy/10">
              <p className="text-xs uppercase tracking-wider font-semibold text-premium-teal mb-1">
                AI Assistant & Chat Privacy [Marked for Legal Review]
              </p>
              <p className="text-deep-navy/70 font-light text-sm leading-relaxed">
                Our website includes an AI-powered chat assistant. When you chat with the assistant, your messages are sent securely in real time to our AI provider (Google Gemini) to generate helpful replies. We do not store chat transcripts. If you choose to submit an appointment booking request through the chat, your submitted contact and appointment details are handled in the exact same manner as our appointment booking form. You may contact the clinic at any time to request access to or deletion of your personal details.
              </p>
            </div>
            <p className="text-deep-navy/70 font-light">
              To ask about your data, please contact the clinic using the details in the website footer.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
