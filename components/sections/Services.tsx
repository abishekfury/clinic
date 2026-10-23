"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "cosmetic",
    title: "Cosmetic Dentistry",
    description: "Veneers, bonding, and total smile makeovers tailored to your facial structure.",
    image: "https://images.unsplash.com/photo-1598256989800-fea5ce5146ce?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "implants",
    title: "Dental Implants",
    description: "Permanent, natural-looking tooth replacements that restore full function.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "whitening",
    title: "Teeth Whitening",
    description: "Professional laser whitening for a brilliantly bright smile in one session.",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "invisalign",
    title: "Invisalign",
    description: "Clear, comfortable aligners for discreet orthodontic treatment.",
    image: "https://images.unsplash.com/photo-1536841732565-43029f63ab87?q=80&w=600&auto=format&fit=crop"
  }
];

export default function Services() {
  return (
    <section id="services" className="py-32 bg-warm-beige relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-light text-deep-navy tracking-tight mb-6">
              Bespoke <span className="font-semibold italic">treatments</span> for exceptional results.
            </h2>
            <p className="text-deep-navy/70 text-lg font-light leading-relaxed">
              Our comprehensive range of premium dental services is designed to enhance your natural beauty and ensure optimal oral health, utilizing the latest advancements in modern dentistry.
            </p>
          </div>
          <Link
            href="#all-services"
            className="inline-flex items-center gap-2 pb-1 border-b border-deep-navy/30 text-deep-navy hover:border-deep-navy transition-colors whitespace-nowrap"
          >
            View all services <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-deep-navy/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-deep-navy mb-3 group-hover:text-premium-teal transition-colors">
                  {service.title}
                </h3>
                <p className="text-deep-navy/70 text-sm font-light leading-relaxed flex-1">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
