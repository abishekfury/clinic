"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { MoveHorizontal } from "lucide-react";

export default function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", () => setIsDragging(false));
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", () => setIsDragging(false));
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", () => setIsDragging(false));
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  return (
    <section id="before-after" className="py-24 md:py-32 bg-warm-beige">
      <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-light text-deep-navy tracking-tight mb-6">
          The art of <span className="font-semibold italic text-premium-teal">transformation</span>
        </h2>
        <p className="text-deep-navy/70 text-lg font-light leading-relaxed mb-16 max-w-2xl mx-auto">
          Witness the life-changing impact of our bespoke cosmetic treatments. Slide to reveal the journey from insecurity to complete confidence.
        </p>

        <div 
          ref={containerRef}
          className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl overflow-hidden cursor-ew-resize shadow-2xl shadow-deep-navy/10"
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            handleMove(e.touches[0].clientX);
          }}
        >
          {/* After Image (Background) */}
          <div className="absolute inset-0 select-none">
            <Image
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop"
              alt="After transformation"
              fill
              className="object-cover pointer-events-none"
            />
            <div className="absolute top-6 right-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium">
              After
            </div>
          </div>

          {/* Before Image (Clipped) */}
          <div 
            className="absolute inset-0 select-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            {/* Ideally this would be a real "Before" image of the same subject. Using a different one for demo. */}
            <Image
              src="https://images.unsplash.com/photo-1598256989800-fea5ce5146ce?q=80&w=1200&auto=format&fit=crop"
              alt="Before transformation"
              fill
              className="object-cover pointer-events-none filter grayscale sepia-[0.3]"
            />
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-sm font-medium">
              Before
            </div>
          </div>

          {/* Slider handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto">
              <MoveHorizontal size={24} className="text-deep-navy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
