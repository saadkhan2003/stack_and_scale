import * as React from "react";

/**
 * Linear Horizon & Architectural Grid Mesh Hero Backdrop
 *
 * Designed with pure SVG and hardware-accelerated CSS layers:
 * 1. Deep celestial aurora gradient cone (indigo & teal)
 * 2. Radial-masked coordinate blueprint grid
 * 3. Concentric elliptical horizon arcs
 * 4. Micro-pulsing sovereign edge nodes
 */
export function HeroBackdrop() {
  return (
    <div
      className="hero-backdrop-container absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Radiant Aurora Core Glow (Directly behind the text) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[580px] pointer-events-none">
        {/* Intense Headline Aura Beam */}
        <div
          className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[360px] sm:h-[440px] rounded-full blur-[60px] opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(94, 106, 210, 0.48) 0%, rgba(128, 221, 209, 0.3) 38%, rgba(80, 110, 230, 0.15) 65%, transparent 80%)",
          }}
        />

        {/* Vertical Zenith Shaft */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[520px] h-[400px] blur-[45px] opacity-75"
          style={{
            background:
              "radial-gradient(ellipse 50% 70% at 50% 20%, rgba(128, 221, 209, 0.38) 0%, rgba(94, 106, 210, 0.22) 50%, transparent 80%)",
          }}
        />

        {/* Ambient Top Horizon Laser Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-[#80ddd1]/60 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px]" />
      </div>

      {/* 2. Architectural Coordinate Grid with Radial Mask */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[580px] opacity-65 sm:opacity-80"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black 25%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black 25%, transparent 85%)",
        }}
      >
        <svg
          className="w-full h-full text-white/[0.12]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-architectural-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              {/* Coordinate Crosshairs at intersections */}
              <circle cx="0" cy="0" r="1.5" fill="rgba(128, 221, 209, 0.7)" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#hero-architectural-grid)"
          />
        </svg>
      </div>

      {/* 3. Celestial Horizon Concentric Arcs */}
      <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 w-[340px] sm:w-[720px] md:w-[1020px] h-[480px] opacity-80 sm:opacity-95">
        <svg
          viewBox="0 0 1020 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="hero-arc-grad-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0" />
              <stop offset="25%" stopColor="#5e6ad2" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#80ddd1" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#5e6ad2" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#5e6ad2" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hero-arc-grad-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#80ddd1" stopOpacity="0" />
              <stop offset="40%" stopColor="#80ddd1" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#80ddd1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#80ddd1" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="hero-star-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#80ddd1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#80ddd1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Primary Outer Celestial Horizon Arc */}
          <ellipse
            cx="510"
            cy="130"
            rx="460"
            ry="210"
            stroke="url(#hero-arc-grad-1)"
            strokeWidth="1.2"
            strokeDasharray="5 7"
          />

          {/* Inner Accent Orbital Ring */}
          <ellipse
            cx="510"
            cy="150"
            rx="310"
            ry="140"
            stroke="url(#hero-arc-grad-2)"
            strokeWidth="1.5"
          />

          {/* Apex Zenith Star with Pulsing Halo */}
          <circle
            cx="510"
            cy="10"
            r="12"
            fill="url(#hero-star-glow)"
            className="animate-pulse"
          />
          <circle cx="510" cy="10" r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* 4. High-Tech Constellation Edge Nodes with Glowing Beacons */}
      <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-full max-w-[1080px] h-[320px] hidden sm:block">
        {/* Node 1: Left Top (edge-iad1) */}
        <div className="absolute top-[22%] left-[12%] flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded border border-[#80ddd1]/30 shadow-[0_0_12px_rgba(128,221,209,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#80ddd1] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#80ddd1]" />
          </span>
          <span className="text-[10px] font-mono text-zinc-300 font-medium tracking-wider">
            edge-iad1 · 0.9ms
          </span>
        </div>

        {/* Node 2: Right Top (mesh-sfo1) */}
        <div className="absolute top-[18%] right-[10%] flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded border border-[#5e6ad2]/40 shadow-[0_0_12px_rgba(94,106,210,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5e6ad2] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5e6ad2]" />
          </span>
          <span className="text-[10px] font-mono text-zinc-300 font-medium tracking-wider">
            mesh-sfo1 · active
          </span>
        </div>

        {/* Node 3: Center-Right Lower (fra-core) */}
        <div className="absolute bottom-[24%] right-[22%] flex items-center gap-1.5 opacity-90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.12)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-300 tracking-wider">
            fra-sovereign · airgapped
          </span>
        </div>
      </div>
    </div>
  );
}
