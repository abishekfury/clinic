"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Eleanor Vance",
    treatment: "Full Smile Makeover",
    text: "I spent years hiding my smile in photos. Dr. Jenkins and her team didn't just fix my teeth; they gave me back my confidence. The process was completely painless and the environment feels more like a spa than a clinic.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Marcus Sterling",
    treatment: "Dental Implants",
    text: "The level of care and precision here is unmatched. From the digital scanning to the final placement, everything was explained clearly. My implants look and feel exactly like natural teeth. Truly world-class.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Sophia Rossi",
    treatment: "Invisalign",
    text: "As a public speaker, I couldn't do traditional braces. The Invisalign treatment here was discreet, fast, and the results are stunning. The concierge-level service makes every visit a pleasure.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 bg-deep-navy text-soft-white relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-premium-teal/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
            Stories of <span className="font-semibold italic text-premium-teal">confidence</span>
          </h2>
          <p className="text-soft-white/70 text-lg font-light">
            Don't just take our word for it. Hear from those who have experienced the Lumina difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass p-8 md:p-10 rounded-3xl relative"
            >
              <Quote className="absolute top-8 right-8 text-white/10" size={48} />
              
              <div className="flex items-center gap-1 mb-6 text-muted-gold">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} fill="currentColor" />
                ))}
              </div>
              
              <p className="text-soft-white/80 font-light leading-relaxed mb-8 relative z-10">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-white">{testimonial.name}</div>
                  <div className="text-sm text-premium-teal">{testimonial.treatment}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
