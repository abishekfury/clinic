"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

const steps = [
  {
    num: "01",
    title: "Consultation",
    desc: "A personalized 1-on-1 session to understand your aesthetic goals and examine your oral health.",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"
  },
  {
    num: "02",
    title: "Digital Scan",
    desc: "Using state-of-the-art 3D imaging to create a precise map of your facial structure and teeth.",
    img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop"
  },
  {
    num: "03",
    title: "Treatment",
    desc: "Experience pain-free procedure in our calming, spa-like environment with premium care.",
    img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop"
  },
  {
    num: "04",
    title: "Transformation",
    desc: "Walk out with a confident, radiant smile that feels completely natural and uniquely yours.",
    img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop"
  }
];

export default function Storytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    let ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".story-step");
      
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => "+=" + scrollRef.current?.offsetWidth,
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section id="storytelling" ref={containerRef} className="bg-deep-navy text-soft-white overflow-hidden relative">
      <div className="absolute top-12 left-6 md:left-12 z-10 max-w-sm">
        <h2 className="text-3xl md:text-4xl font-light tracking-tight">
          Your smile <span className="font-semibold italic text-premium-teal">journey</span>
        </h2>
      </div>

      <div ref={scrollRef} className="flex h-screen items-center w-[400vw] md:w-[200vw]">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="story-step w-screen md:w-[50vw] h-full flex flex-col justify-center px-6 md:px-16"
          >
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full max-w-4xl mx-auto">
              
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <div className="text-premium-teal text-6xl md:text-8xl font-light mb-4 md:mb-8 opacity-50">
                  {step.num}
                </div>
                <h3 className="text-2xl md:text-4xl font-semibold mb-4">{step.title}</h3>
                <p className="text-soft-white/70 text-lg font-light leading-relaxed max-w-md">
                  {step.desc}
                </p>
              </div>

              <div className="w-full md:w-1/2 order-1 md:order-2 h-[35vh] md:h-[55vh] relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                <Image
                  src={step.img}
                  alt={step.title}
                  fill
                  className="object-cover"
                />
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
