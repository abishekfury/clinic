"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Services", href: "/#services" },
  { name: "Our Approach", href: "/#storytelling" },
  { name: "Transformations", href: "/#before-after" },
  { name: "Reviews", href: "/#testimonials" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
        isScrolled
          ? "glass py-4 border-white/10 dark:border-white/5 shadow-sm"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-premium-teal flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform">
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-deep-navy dark:text-soft-white">
            Lumina Dental
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-deep-navy/70 hover:text-premium-teal dark:text-soft-white/70 dark:hover:text-premium-teal transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/book-appointment"
            className="px-6 py-2.5 rounded-full bg-deep-navy text-soft-white hover:bg-deep-navy/90 dark:bg-soft-white dark:text-deep-navy dark:hover:bg-soft-white/90 text-sm font-medium transition-all hover:shadow-lg hover:shadow-deep-navy/20"
          >
            Book Appointment
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden text-deep-navy dark:text-soft-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass border-b border-white/10 flex flex-col p-6 shadow-xl md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="py-4 text-lg font-medium border-b border-deep-navy/5 dark:border-soft-white/5 text-deep-navy dark:text-soft-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/book-appointment"
              className="mt-6 px-6 py-3 rounded-full bg-premium-teal text-white text-center font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Appointment
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
