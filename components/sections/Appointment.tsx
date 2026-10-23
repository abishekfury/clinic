"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function Appointment() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic
    console.log(formData);
  };

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
          <div className="w-full md:w-7/12 p-10 md:p-14 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    required
                    className="block w-full px-0 py-3 text-deep-navy bg-transparent border-0 border-b border-deep-navy/20 appearance-none focus:outline-none focus:ring-0 focus:border-premium-teal peer transition-colors"
                    placeholder=" "
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <label
                    htmlFor="name"
                    className="absolute text-sm text-deep-navy/50 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-premium-teal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Full Name
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    required
                    className="block w-full px-0 py-3 text-deep-navy bg-transparent border-0 border-b border-deep-navy/20 appearance-none focus:outline-none focus:ring-0 focus:border-premium-teal peer transition-colors"
                    placeholder=" "
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <label
                    htmlFor="phone"
                    className="absolute text-sm text-deep-navy/50 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-premium-teal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Phone Number
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  type="email"
                  id="email"
                  required
                  className="block w-full px-0 py-3 text-deep-navy bg-transparent border-0 border-b border-deep-navy/20 appearance-none focus:outline-none focus:ring-0 focus:border-premium-teal peer transition-colors"
                  placeholder=" "
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <label
                  htmlFor="email"
                  className="absolute text-sm text-deep-navy/50 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-premium-teal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Email Address
                </label>
              </div>

              <div className="relative">
                <select
                  id="service"
                  className="block w-full px-0 py-3 text-deep-navy bg-transparent border-0 border-b border-deep-navy/20 appearance-none focus:outline-none focus:ring-0 focus:border-premium-teal peer transition-colors"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="cosmetic">Cosmetic Dentistry</option>
                  <option value="implants">Dental Implants</option>
                  <option value="invisalign">Invisalign</option>
                  <option value="general">General Checkup</option>
                  <option value="other">Other</option>
                </select>
                <label
                  htmlFor="service"
                  className={`absolute text-sm duration-300 transform top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-premium-teal peer-focus:scale-75 peer-focus:-translate-y-6 ${
                    formData.service ? "scale-75 -translate-y-6 text-deep-navy/50" : "scale-100 translate-y-0 text-deep-navy/50"
                  }`}
                >
                  Interested Service
                </label>
              </div>

              <div className="relative pt-4">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-deep-navy text-soft-white text-base font-medium hover:bg-deep-navy/90 transition-all hover:shadow-xl hover:shadow-deep-navy/20 group"
                >
                  Request Appointment
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
