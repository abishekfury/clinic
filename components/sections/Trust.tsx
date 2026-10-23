"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const stats = [
  { label: "Years of Excellence", value: 15, suffix: "+" },
  { label: "Certified Specialists", value: 12, suffix: "" },
  { label: "Happy Patients", value: 10, suffix: "k+" },
  { label: "Awards Won", value: 25, suffix: "" },
];

function Counter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * (to - from) + from));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [from, to, duration]);

  return <span>{count}</span>;
}

export default function Trust() {
  return (
    <section className="py-24 bg-soft-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center text-center group"
            >
              <div className="text-4xl md:text-5xl font-light text-deep-navy mb-2 flex items-baseline">
                <Counter from={0} to={stat.value} />
                <span className="text-premium-teal ml-1">{stat.suffix}</span>
              </div>
              <div className="text-sm md:text-base text-deep-navy/60 font-medium tracking-wide uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
