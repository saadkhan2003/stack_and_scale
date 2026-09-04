"use client";

import { useState } from "react";
import { handleCardSpotlight } from "./landing-interactive";

export function LinearFiguresSection() {
  const [hoveredFig, setHoveredFig] = useState<number | null>(null);

  return (
    <section 
      className="relative w-full max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.06] bg-black text-white"
      aria-label="Core architectural foundations"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-xs uppercase tracking-[0.25em] text-[#80ddd1] font-mono font-semibold mb-3">
          Architectural Principles
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Engineered for sovereignty and speed.
        </h2>
        <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
          Linear precision applied to mission-critical infrastructure. Own your code, deploy to edge nodes, and eliminate third-party SaaS vulnerabilities.
        </p>
      </div>

      {/* 3-Column Figures Grid matching Linear's exact layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* FIG 0.1 - Purpose-built */}
        <article 
          className="group relative rounded-2xl border border-white/[0.08] bg-[#050505] p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(128,221,209,0.06)] spotlight-card"
          onMouseMove={handleCardSpotlight}
          onMouseEnter={() => setHoveredFig(1)}
          onMouseLeave={() => setHoveredFig(null)}
        >
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase block mb-6 font-semibold">
              FIG 0.1
            </span>

            {/* Graphic Container */}
            <div className="w-full h-56 flex items-center justify-center relative mb-8 select-none">
              <svg 
                viewBox="0 0 260 200" 
                className="w-full h-full max-w-[240px] overflow-visible transition-transform duration-500 group-hover:scale-105"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="discGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#80ddd1" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="glowRays" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#80ddd1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#80ddd1" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Ambient glow behind stack */}
                <circle cx="130" cy="100" r="60" fill="url(#glowRays)" className="opacity-15 blur-xl group-hover:opacity-30 transition-opacity" />

                {/* Stacked isometric discs (bottom to top) */}
                {/* Level 4 (Base) */}
                <g className="transition-transform duration-500 group-hover:translate-y-2">
                  <path d="M 60 135 A 70 32 0 0 0 200 135 v 16 A 70 32 0 0 1 60 151 Z" fill="#0c0c0e" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                  <ellipse cx="130" cy="135" rx="70" ry="32" fill="#09090b" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="3 3" />
                </g>

                {/* Level 3 */}
                <g className="transition-transform duration-500 group-hover:translate-y-1">
                  <path d="M 60 115 A 70 32 0 0 0 200 115 v 16 A 70 32 0 0 1 60 131 Z" fill="#0e0e11" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <ellipse cx="130" cy="115" rx="70" ry="32" fill="#0c0c0e" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                </g>

                {/* Level 2 */}
                <g className="transition-transform duration-500 group-hover:translate-y-0">
                  <path d="M 60 95 A 70 32 0 0 0 200 95 v 16 A 70 32 0 0 1 60 111 Z" fill="#121216" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                  <ellipse cx="130" cy="95" rx="70" ry="32" fill="#0e0e12" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                </g>

                {/* Level 1 (Top Plate) */}
                <g className="transition-transform duration-500 group-hover:-translate-y-1">
                  <path d="M 60 75 A 70 32 0 0 0 200 75 v 16 A 70 32 0 0 1 60 91 Z" fill="#16161c" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                  <ellipse cx="130" cy="75" rx="70" ry="32" fill="#14141a" stroke="url(#discGrad)" strokeWidth="1.2" />

                  {/* Concentric grooved tracks */}
                  <ellipse cx="130" cy="75" rx="52" ry="24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <ellipse cx="130" cy="75" rx="34" ry="15" fill="none" stroke="rgba(128,221,209,0.5)" strokeWidth="1" strokeDasharray="4 2" className="animate-[spin_20s_linear_infinite] origin-center" />

                  {/* Center core disc with etched horizontal wireframe hatch */}
                  <ellipse cx="130" cy="75" rx="22" ry="10" fill="#09090c" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                  <line x1="114" y1="72" x2="146" y2="72" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                  <line x1="112" y1="75" x2="148" y2="75" stroke="#80ddd1" strokeWidth="1" />
                  <line x1="115" y1="78" x2="145" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                </g>

                {/* Center axis alignment pin */}
                <line x1="130" y1="45" x2="130" y2="70" stroke="#80ddd1" strokeWidth="1.5" strokeDasharray="2 2" className="animate-pulse" />
                <circle cx="130" cy="45" r="2.5" fill="#80ddd1" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
              Purpose-built
            </h3>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed">
              Stack &amp; Scale is shaped by zero-trust isolation and 100% data custody. Sovereign software running directly on your edge hardware and private VPC.
            </p>
          </div>
        </article>

        {/* FIG 0.2 - Powered by agents */}
        <article 
          className="group relative rounded-2xl border border-white/[0.08] bg-[#050505] p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(94,106,210,0.08)] spotlight-card"
          onMouseMove={handleCardSpotlight}
          onMouseEnter={() => setHoveredFig(2)}
          onMouseLeave={() => setHoveredFig(null)}
        >
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase block mb-6 font-semibold">
              FIG 0.2
            </span>

            {/* Graphic Container */}
            <div className="w-full h-56 flex items-center justify-center relative mb-8 select-none">
              <svg 
                viewBox="0 0 260 200" 
                className="w-full h-full max-w-[240px] overflow-visible transition-transform duration-500 group-hover:scale-105"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="cubeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#80ddd1" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Back-left medium cube */}
                <g className="transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  {/* Top */}
                  <polygon points="80,50 115,30 150,50 115,70" fill="#0d0d12" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  {/* Left */}
                  <polygon points="80,50 115,70 115,115 80,95" fill="#08080a" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  {/* Right */}
                  <polygon points="115,70 150,50 150,95 115,115" fill="#0a0a0e" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  {/* Top dot */}
                  <circle cx="115" cy="50" r="2" fill="#5e6ad2" />
                </g>

                {/* Back-right tall cube */}
                <g className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  {/* Top */}
                  <polygon points="145,45 180,25 215,45 180,65" fill="#13131a" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  {/* Left */}
                  <polygon points="145,45 180,65 180,125 145,105" fill="#0a0a0f" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  {/* Right */}
                  <polygon points="180,65 215,45 215,105 180,125" fill="#0e0e14" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  {/* Top grid cross */}
                  <line x1="162" y1="35" x2="198" y2="55" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                  <line x1="198" y1="35" x2="162" y2="55" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                  <circle cx="180" cy="45" r="2.5" fill="#80ddd1" className="animate-pulse" />
                </g>

                {/* Front-left wide cube */}
                <g className="transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1">
                  {/* Top */}
                  <polygon points="50,90 95,65 140,90 95,115" fill="#15151e" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  {/* Left */}
                  <polygon points="50,90 95,115 95,155 50,130" fill="#0b0b10" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  {/* Right */}
                  <polygon points="95,115 140,90 140,130 95,155" fill="#0f0f16" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  {/* Top wireframe subdivisions */}
                  <line x1="72" y1="78" x2="117" y2="102" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                  <line x1="117" y1="78" x2="72" y2="102" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                  <circle cx="95" cy="90" r="2" fill="#5e6ad2" />
                </g>

                {/* Front-right small cube */}
                <g className="transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1">
                  {/* Top */}
                  <polygon points="125,110 155,93 185,110 155,127" fill="#181822" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
                  {/* Left */}
                  <polygon points="125,110 155,127 155,160 125,143" fill="#0c0c11" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                  {/* Right */}
                  <polygon points="155,127 185,110 185,143 155,160" fill="#111118" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                  <circle cx="155" cy="110" r="2" fill="#80ddd1" />
                </g>

                {/* Connecting telemetry pulse lines */}
                <path d="M 95 90 L 115 50 L 180 45 L 155 110" fill="none" stroke="rgba(128,221,209,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="135" cy="48" r="3" fill="#80ddd1" className="animate-ping" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
              Powered by agents
            </h3>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed">
              Designed for workflows shared by humans and automated pipelines. Continuous offline-to-cloud synchronization and autonomous event dispatch across edge nodes.
            </p>
          </div>
        </article>

        {/* FIG 0.3 - Designed for speed */}
        <article 
          className="group relative rounded-2xl border border-white/[0.08] bg-[#050505] p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.06)] spotlight-card"
          onMouseMove={handleCardSpotlight}
          onMouseEnter={() => setHoveredFig(3)}
          onMouseLeave={() => setHoveredFig(null)}
        >
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase block mb-6 font-semibold">
              FIG 0.3
            </span>

            {/* Graphic Container */}
            <div className="w-full h-56 flex items-center justify-center relative mb-8 select-none">
              <svg 
                viewBox="0 0 260 200" 
                className="w-full h-full max-w-[240px] overflow-visible transition-transform duration-500 group-hover:scale-105"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="finGlow" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="#80ddd1" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Ambient backplane glow */}
                <rect x="110" y="30" width="100" height="120" fill="rgba(128,221,209,0.04)" className="blur-xl" />

                {/* Isometric Stepped Speed Fins (radiator blades stepping up) */}
                {[
                  { x: 55, y: 155, h: 18, op: 0.25 },
                  { x: 67, y: 148, h: 26, op: 0.3 },
                  { x: 79, y: 141, h: 34, op: 0.35 },
                  { x: 91, y: 134, h: 44, op: 0.4 },
                  { x: 103, y: 127, h: 54, op: 0.45 },
                  { x: 115, y: 120, h: 64, op: 0.5 },
                  { x: 127, y: 113, h: 76, op: 0.55 },
                  { x: 139, y: 106, h: 88, op: 0.6 },
                  { x: 151, y: 99, h: 100, op: 0.65 },
                  { x: 163, y: 92, h: 112, op: 0.7 },
                  { x: 175, y: 85, h: 124, op: 0.75 },
                  { x: 187, y: 78, h: 138, op: 0.85 },
                  { x: 199, y: 71, h: 150, op: 0.95 },
                ].map((fin, i) => {
                  const xTop = fin.x + 35;
                  const yTop = fin.y - 20;
                  return (
                    <g key={i} className="transition-all duration-300 group-hover:brightness-110">
                      {/* Vertical fin slab */}
                      <path
                        d={`M ${fin.x} ${fin.y} L ${fin.x} ${fin.y - fin.h} L ${xTop} ${yTop - fin.h} L ${xTop} ${yTop} Z`}
                        fill={`rgba(18, 18, 24, ${fin.op})`}
                        stroke={i === 12 ? "#80ddd1" : `rgba(255, 255, 255, ${fin.op * 0.7})`}
                        strokeWidth="1"
                      />
                      {/* Luminous Top Edge */}
                      <line
                        x1={fin.x}
                        y1={fin.y - fin.h}
                        x2={xTop}
                        y2={yTop - fin.h}
                        stroke={i >= 10 ? "#80ddd1" : "rgba(255,255,255,0.7)"}
                        strokeWidth={i >= 10 ? 1.5 : 1}
                      />
                    </g>
                  );
                })}

                {/* High velocity motion trail vector */}
                <line 
                  x1="45" 
                  y1="165" 
                  x2="235" 
                  y2="55" 
                  stroke="rgba(128,221,209,0.4)" 
                  strokeWidth="1.2" 
                  strokeDasharray="6 4" 
                  className="animate-pulse"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
              Designed for speed
            </h3>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed">
              Reduces noise and restores momentum. Sub-5ms local SQLite operations, instant background delta queues, and 99.999% fault-tolerant execution.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
