"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
  /** Auto-slide interval in ms (default 5000) */
  interval?: number;
  className?: string;
  /** Overlay content like a badge */
  children?: React.ReactNode;
};

export function NewsCarousel({ images, alt, interval = 5000, className = "h-48 sm:h-52", children }: Props) {
  const [current, setCurrent] = useState(0);
  const len = images.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % len), [len]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + len) % len), [len]);

  // Auto-slide
  useEffect(() => {
    if (len <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [len, interval, next]);

  if (len === 0) return null;

  return (
    <div className={`relative overflow-hidden group/carousel ${className}`}>
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
        >
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ))}

      {/* Arrows — only if multiple images */}
      {len > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/60"
            aria-label="Image précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/60"
            aria-label="Image suivante"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? "bg-white w-3" : "bg-white/50"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Children overlay (badge, etc.) */}
      {children}
    </div>
  );
}
