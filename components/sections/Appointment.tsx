import AppointmentForm from "@/components/forms/AppointmentForm";

export default function Appointment() {
  return (
    <section id="appointment" className="py-24 md:py-32 bg-warm-beige relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl mx-auto bg-white rounded-[40px] shadow-2xl shadow-deep-navy/5 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Info Panel */}
          <div className="w-full md:w-5/12 bg-deep-navy p-10 md:p-14 text-soft-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-premium-teal/20 blur-[60px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-light mb-4">
                Begin your <span className="font-semibold italic text-premium-teal">journey</span>
              </h2>
              <p className="text-soft-white/70 font-light mb-12">
                Schedule a private consultation to discuss your goals in a relaxed, pressure-free environment.
              </p>
            </div>

            <div className="relative z-10 space-y-8">
              <div>
                <div className="text-xs font-semibold tracking-widest uppercase text-premium-teal mb-2">Location</div>
                <p className="font-light text-soft-white/80">123 Luxury Avenue, Suite 400<br/>Beverly Hills, CA 90210</p>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-widest uppercase text-premium-teal mb-2">Hours</div>
                <p className="font-light text-soft-white/80">Mon-Fri: 9am - 6pm<br/>Sat: 10am - 2pm</p>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="w-full md:w-7/12 p-10 md:p-14 bg-white relative">
            <AppointmentForm />
          </div>

        </div>
      </div>
    </section>
  );
}
