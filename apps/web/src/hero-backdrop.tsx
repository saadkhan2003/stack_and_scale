import * as React from "react";

/**
 * Minimal Blueprint Grid Hero Backdrop
 *
 * Clean, minimal architectural grid with fine hairline strokes
 * and soft radial vignette fading seamlessly into the background.
 */
export function HeroBackdrop() {
  return (
    <div
      className="hero-backdrop-container absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Subtle Ambient Top Horizon Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Minimal Coordinate Grid with Radial Vignette */}
      <div
        className="absolute inset-0 w-full h-[650px]"
        style={{
          maskImage:
            "radial-gradient(ellipse 65% 50% at 50% 32%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 50% at 50% 32%, black 20%, transparent 80%)",
        }}
      >
        <svg
          className="w-full h-full text-white/[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-minimal-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              {/* Micro crosshair dot at intersection */}
              <circle cx="0" cy="0" r="1" fill="rgba(255, 255, 255, 0.25)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-minimal-grid)" />
        </svg>
      </div>

      {/* Very soft, whisper-quiet center radial highlight */}
      <div
        className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[80px] opacity-25 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
