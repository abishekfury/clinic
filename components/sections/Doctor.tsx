import Image from "next/image";

export default function Doctor() {
  return (
    <section className="py-24 bg-soft-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          
          {/* Editorial Image */}
          <div className="w-full md:w-1/2 relative h-[600px] md:h-[800px] rounded-t-full rounded-b-[40px] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop"
              alt="Dr. Sarah Jenkins"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="font-serif text-3xl italic mb-2">Sarah Jenkins</div>
              <div className="text-sm font-light tracking-widest uppercase opacity-80">Lead Cosmetic Dentist</div>
            </div>
          </div>

          {/* Bio Content */}
          <div className="w-full md:w-1/2 max-w-xl">
            <div className="inline-block px-3 py-1 mb-6 border border-deep-navy/20 rounded-full text-xs font-semibold tracking-widest uppercase text-deep-navy/60">
              Meet The Founder
            </div>
            
            <h2 className="text-4xl md:text-5xl font-light text-deep-navy mb-8 leading-tight">
              "Dentistry is not just about teeth; it's about restoring <span className="font-semibold italic">human connection</span>."
            </h2>
            
            <div className="space-y-6 text-deep-navy/70 font-light text-lg leading-relaxed mb-12">
              <p>
                Dr. Jenkins established Lumina Dental with a singular vision: to redefine the dental experience from a dreaded chore into a restorative wellness ritual.
              </p>
              <p>
                With over 15 years of specialized training in cosmetic and reconstructive dentistry across Europe and the US, she blends meticulous clinical precision with an artist's eye for facial harmony.
              </p>
            </div>

            {/* Certifications / Credentials */}
            <div className="grid grid-cols-2 gap-8 border-t border-deep-navy/10 pt-8">
              <div>
                <div className="text-3xl font-light text-premium-teal mb-2">UCLA</div>
                <div className="text-sm text-deep-navy/60 font-medium">Doctor of Dental Surgery</div>
              </div>
              <div>
                <div className="text-3xl font-light text-premium-teal mb-2">AACD</div>
                <div className="text-sm text-deep-navy/60 font-medium">Accredited Member</div>
              </div>
            </div>

            {/* Signature */}
            <div className="mt-12 opacity-80">
              {/* Handwritten signature placeholder using a stylish font or SVG */}
              <div className="font-serif italic text-4xl text-deep-navy/40">Dr. Sarah Jenkins</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
