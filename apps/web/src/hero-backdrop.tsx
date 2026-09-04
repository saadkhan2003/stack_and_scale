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
      className="hero-backdrop-container absolute inset-0 overflow-hidden pointer-events-none select-none -z-10"
      aria-hidden="true"
    >
      {/* 1. Deep Celestial Aurora Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[550px] sm:h-[650px] opacity-80">
        {/* Primary Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(94,106,210,0.22)_0%,rgba(128,221,209,0.12)_35%,rgba(9,9,11,0)_70%)] blur-[50px] animate-pulse [animation-duration:8s]" />

        {/* Vertical Light Shaft / Ray */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(128,221,209,0.18)_0%,rgba(94,106,210,0.08)_40%,transparent_75%)] blur-[40px]" />

        {/* Ambient Top Horizon Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#80ddd1]/40 to-transparent" />
      </div>

      {/* 2. Architectural Coordinate Grid with Radial Mask */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] opacity-40 sm:opacity-55"
        style={{
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 30%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 30%, black 20%, transparent 80%)",
        }}
      >
        <svg
          className="w-full h-full text-white/[0.07]"
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
              <circle cx="0" cy="0" r="1" fill="rgba(128, 221, 209, 0.4)" />
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
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[340px] sm:w-[680px] md:w-[960px] h-[480px] opacity-50 sm:opacity-75">
        <svg
          viewBox="0 0 960 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="arc-gradient-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0" />
              <stop offset="30%" stopColor="#5e6ad2" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#80ddd1" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#5e6ad2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#5e6ad2" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="arc-gradient-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#80ddd1" stopOpacity="0" />
              <stop offset="45%" stopColor="#80ddd1" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#80ddd1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#80ddd1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Primary Celestial Arc */}
          <ellipse
            cx="480"
            cy="120"
            rx="420"
            ry="200"
            stroke="url(#arc-gradient-1)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />

          {/* Inner Accent Orbital Ring */}
          <ellipse
            cx="480"
            cy="140"
            rx="280"
            ry="130"
            stroke="url(#arc-gradient-2)"
            strokeWidth="1.2"
          />

          {/* Apex Focal Star / Zenith Point */}
          <circle
            cx="480"
            cy="10"
            r="2.5"
            fill="#80ddd1"
            className="animate-ping [animation-duration:3s]"
          />
          <circle cx="480" cy="10" r="2" fill="#ffffff" />
        </svg>
      </div>

      {/* 4. Pulsing Edge Node Micro-Constellations */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] hidden sm:block">
        {/* Node 1: Left */}
        <div className="absolute top-[25%] left-[18%] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#80ddd1] shadow-[0_0_10px_#80ddd1] animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
            edge-iad1
          </span>
        </div>

        {/* Node 2: Right */}
        <div className="absolute top-[18%] right-[16%] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] shadow-[0_0_10px_#5e6ad2] animate-pulse [animation-delay:1.5s]" />
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
            mesh-sfo1
          </span>
        </div>

        {/* Node 3: Center-Bottom */}
        <div className="absolute bottom-[20%] right-[30%] flex items-center gap-1.5 opacity-60">
          <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse [animation-delay:2.5s]" />
          <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider">
            0.8ms sync
          </span>
        </div>
      </div>
    </div>
  );
}
