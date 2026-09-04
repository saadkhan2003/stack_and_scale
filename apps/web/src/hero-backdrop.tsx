import * as React from "react";

/**
 * Enterprise Engineering Grid — Professional Blueprint Backdrop
 *
 * Modeled after Linear and Vercel infrastructure surfaces:
 * 1. Dual-scale grid hierarchy (64px major grid + 16px subtle subdivision)
 * 2. High-precision vector crosshairs (+) at major coordinate intersections
 * 3. Centered page symmetry (aligns precisely with center axis)
 * 4. Smooth exponential radial falloff mask fading seamlessly into #000000
 * 5. Clean top boundary illumination hairline
 */
export function HeroBackdrop() {
  return (
    <div
      className="hero-backdrop-container absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Top Boundary Horizon Hairline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1280px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Professional Dual-Scale Architectural Grid */}
      <div
        className="absolute inset-0 w-full h-[680px]"
        style={{
          maskImage:
            "radial-gradient(ellipse 60% 55% at 50% 30%, black 15%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 50% 30%, black 15%, transparent 80%)",
        }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Minor 16px sub-grid */}
            <pattern
              id="hero-grid-minor"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 16 0 L 0 0 0 16"
                fill="none"
                stroke="rgba(255, 255, 255, 0.02)"
                strokeWidth="1"
              />
            </pattern>

            {/* Major 64px coordinate grid with precision vector crosshairs */}
            <pattern
              id="hero-grid-major"
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <rect width="64" height="64" fill="url(#hero-grid-minor)" />
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke="rgba(255, 255, 255, 0.065)"
                strokeWidth="1"
              />
              {/* Precision Crosshair (+) at major intersection */}
              <path
                d="M -3 0 L 3 0 M 0 -3 L 0 3"
                stroke="rgba(255, 255, 255, 0.28)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#hero-grid-major)" />
        </svg>
      </div>

      {/* Ultra-subtle ambient center glow */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 w-[700px] h-[360px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12) 0%, transparent 75%)",
        }}
      />
    </div>
  );
}
