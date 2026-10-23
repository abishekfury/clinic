"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, ShieldCheck, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen pt-24 md:pt-0 flex items-center overflow-hidden bg-warm-beige">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-premium-teal/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-deep-navy/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center relative z-10 gap-12 md:gap-8">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 md:pr-12 pt-10 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-premium-teal/10 text-premium-teal text-xs font-semibold mb-6 tracking-wide uppercase">
              <Star size={14} className="fill-premium-teal" />
              <span>Rated 4.9/5 by 2,000+ Patients</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-deep-navy mb-6 leading-[1.1]">
              Crafting <span className="text-premium-teal italic font-light">confident</span> smiles with precision.
            </h1>
            
            <p className="text-lg md:text-xl text-deep-navy/70 mb-10 max-w-lg font-light leading-relaxed">
              Experience modern dentistry designed around your comfort. We combine state-of-the-art technology with a soothing, spa-like atmosphere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="#appointment"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-deep-navy text-soft-white text-base font-medium hover:bg-deep-navy/90 transition-all hover:shadow-xl hover:shadow-deep-navy/20 hover:-translate-y-1"
              >
                Book Consultation
                <ArrowRight size={18} />
              </Link>
              <Link
                href="tel:+15551234567"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-deep-navy/20 text-deep-navy text-base font-medium hover:border-deep-navy/40 hover:bg-deep-navy/5 transition-all"
              >
                <Phone size={18} />
                Emergency Call
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-deep-navy/10">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-warm-beige bg-gray-200 overflow-hidden relative">
                    {/* Placeholder for patient avatars */}
                    <Image
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="Patient"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm text-deep-navy/70">
                <span className="font-bold text-deep-navy block">Trusted by families</span>
                Across Beverly Hills
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Image / Composition */}
        <div className="w-full md:w-1/2 relative h-[500px] md:h-[700px] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative w-full h-full max-h-[600px] rounded-3xl overflow-hidden shadow-2xl shadow-deep-navy/10"
          >
            {/* Main Image */}
            <div className="absolute inset-0 bg-deep-navy/5">
              <Image
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop"
                alt="Premium Dental Clinic"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/40 via-transparent to-transparent" />
            </div>
            
            {/* Floating Card */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              className="absolute bottom-8 left-8 right-8 md:right-auto md:w-72 glass p-5 rounded-2xl"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md text-white">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Certified Experts</div>
                  <div className="text-white/70 text-xs">Top 1% Invisalign Providers</div>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1.2 }}
                  className="h-full bg-muted-gold rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
