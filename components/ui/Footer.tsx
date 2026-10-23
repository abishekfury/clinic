import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-deep-navy text-soft-white py-20 border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 rounded-full bg-premium-teal flex items-center justify-center text-white font-bold text-xl">
              L
            </div>
            <span className="text-xl font-bold tracking-tight">
              Lumina Dental
            </span>
          </Link>
          <p className="text-soft-white/70 text-sm leading-relaxed mb-8">
            Crafting confident smiles with precision. Experience modern dentistry designed around your comfort in a luxurious, calming environment.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-premium-teal hover:border-premium-teal transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-premium-teal hover:border-premium-teal transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-premium-teal hover:border-premium-teal transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
          </div>
        </div>
        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
          <ul className="space-y-4">
            <li><Link href="#services" className="text-soft-white/70 hover:text-white transition-colors text-sm">Services</Link></li>
            <li><Link href="#storytelling" className="text-soft-white/70 hover:text-white transition-colors text-sm">Our Approach</Link></li>
            <li><Link href="#before-after" className="text-soft-white/70 hover:text-white transition-colors text-sm">Transformations</Link></li>
            <li><Link href="#testimonials" className="text-soft-white/70 hover:text-white transition-colors text-sm">Patient Reviews</Link></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-6">Services</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-soft-white/70 hover:text-white transition-colors text-sm">Cosmetic Dentistry</a></li>
            <li><a href="#" className="text-soft-white/70 hover:text-white transition-colors text-sm">Dental Implants</a></li>
            <li><a href="#" className="text-soft-white/70 hover:text-white transition-colors text-sm">Invisalign</a></li>
            <li><a href="#" className="text-soft-white/70 hover:text-white transition-colors text-sm">Teeth Whitening</a></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-premium-teal mt-0.5 flex-shrink-0" />
              <span className="text-soft-white/70 text-sm">123 Luxury Avenue, Suite 400<br/>Beverly Hills, CA 90210</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-premium-teal flex-shrink-0" />
              <span className="text-soft-white/70 text-sm">+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-premium-teal flex-shrink-0" />
              <span className="text-soft-white/70 text-sm">hello@luminadental.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-white/10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-soft-white/50 text-sm">
          &copy; {new Date().getFullYear()} Lumina Dental. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-soft-white/50 hover:text-white text-sm transition-colors">Privacy Policy</a>
          <a href="#" className="text-soft-white/50 hover:text-white text-sm transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
