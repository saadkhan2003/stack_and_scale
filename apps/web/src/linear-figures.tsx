"use client";

import { useState } from "react";
import { handleCardSpotlight } from "./landing-interactive";

export function LinearFiguresSection() {
  const [, setHoveredFig] = useState<number | null>(null);

  return (
    <section 
      className="relative w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.06] bg-black text-white"
      aria-label="Core architectural foundations"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono uppercase tracking-[0.25em] text-[#80ddd1] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#80ddd1] animate-pulse" />
          Architectural Principles
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Engineered for sovereignty and speed.
        </h2>
        <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
          Linear precision applied to mission-critical infrastructure. Own your code, deploy to edge nodes, and eliminate third-party SaaS vulnerabilities.
        </p>
      </div>

      {/* 3-Column Figures Grid matching Linear's exact high-craft aesthetic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* =========================================================================
            FIG 0.1 - PURPOSE-BUILT (Data Sovereignty & Local Hardware Vault)
            ========================================================================= */}
        <article 
          className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/50 via-zinc-950/70 to-black p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-teal-500/30 hover:shadow-[0_0_40px_rgba(45,212,191,0.12),inset_0_1px_0_0_rgba(255,255,255,0.15)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_40px_-15px_rgba(0,0,0,0.8)] spotlight-card"
          onMouseMove={handleCardSpotlight}
          onMouseEnter={() => setHoveredFig(1)}
          onMouseLeave={() => setHoveredFig(null)}
        >
          <div>
            {/* Monospace Header Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-6">
              <span className="font-mono text-xs font-semibold tracking-widest text-zinc-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
                FIG 0.1
              </span>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/[0.08]">
                SOVEREIGN VAULT
              </span>
            </div>

            {/* Technical Viewport Stage */}
            <div className="w-full h-60 rounded-xl bg-zinc-950/90 border border-white/[0.06] relative mb-6 overflow-hidden flex items-center justify-center select-none shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
              {/* Technical Dot Grid Backdrop */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
                  backgroundSize: "16px 16px"
                }}
              />

              {/* Corner Crosshairs */}
              <span className="absolute top-2 left-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute top-2 right-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute bottom-2 left-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute bottom-2 right-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>

              {/* Telemetry Coordinate HUD */}
              <div className="absolute top-2.5 left-6 text-[9px] font-mono text-zinc-500 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-teal-400/80 animate-ping" />
                <span>ISOLATION: AIR-GAPPED</span>
              </div>
              <div className="absolute bottom-2.5 right-6 text-[9px] font-mono text-zinc-500 tracking-wider">
                <span>0x42A // SECURE</span>
              </div>

              {/* Ambient Radiant Core Glow */}
              <div className="absolute w-36 h-36 rounded-full bg-teal-500/15 blur-2xl pointer-events-none group-hover:bg-teal-500/25 transition-colors duration-500" />

              {/* High-Craft Linear SVG Diagram */}
              <svg 
                viewBox="0 0 280 220" 
                className="w-full h-full max-w-[260px] overflow-visible transition-transform duration-500 group-hover:scale-105"
                aria-hidden="true"
              >
                <defs>
                  {/* Disc Rim Gradients */}
                  <linearGradient id="discRimTop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#80ddd1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.3" />
                  </linearGradient>

                  <linearGradient id="discSurface" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e242a" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0c1013" stopOpacity="0.95" />
                  </linearGradient>

                  <linearGradient id="cylinderSideGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#141a1f" />
                    <stop offset="50%" stopColor="#1f2830" />
                    <stop offset="100%" stopColor="#0d1115" />
                  </linearGradient>

                  <linearGradient id="axisLaser" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#80ddd1" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#80ddd1" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="scannerSweep" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#80ddd1" stopOpacity="0" />
                    <stop offset="70%" stopColor="#80ddd1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Concentric Base Calibration Grid Rings */}
                <ellipse cx="140" cy="155" rx="90" ry="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
                <ellipse cx="140" cy="155" rx="105" ry="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />

                {/* Level 4 (Base Disc) */}
                <g className="transition-transform duration-500 group-hover:translate-y-2">
                  <path d="M 65 145 A 75 32 0 0 0 215 145 v 18 A 75 32 0 0 1 65 163 Z" fill="url(#cylinderSideGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <ellipse cx="140" cy="145" rx="75" ry="32" fill="url(#discSurface)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 2" />
                </g>

                {/* Level 3 (Intermediary Layer) */}
                <g className="transition-transform duration-500 group-hover:translate-y-1">
                  <path d="M 65 125 A 75 32 0 0 0 215 125 v 18 A 75 32 0 0 1 65 143 Z" fill="url(#cylinderSideGrad)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                  <ellipse cx="140" cy="125" rx="75" ry="32" fill="url(#discSurface)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  {/* Subtle rim light accent */}
                  <path d="M 65 125 A 75 32 0 0 0 110 152" fill="none" stroke="rgba(128,221,209,0.35)" strokeWidth="1.2" />
                </g>

                {/* Level 2 (Secure Partition) */}
                <g className="transition-transform duration-500 group-hover:translate-y-0">
                  <path d="M 65 105 A 75 32 0 0 0 215 105 v 18 A 75 32 0 0 1 65 123 Z" fill="url(#cylinderSideGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <ellipse cx="140" cy="105" rx="75" ry="32" fill="url(#discSurface)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  {/* Horizontal hash calibrations */}
                  <line x1="72" y1="110" x2="80" y2="110" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <line x1="70" y1="115" x2="82" y2="115" stroke="#80ddd1" strokeWidth="1.2" />
                  <line x1="72" y1="120" x2="80" y2="120" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                </g>

                {/* Level 1 (Top Plate with High-Contrast Luminous Bezel) */}
                <g className="transition-transform duration-500 group-hover:-translate-y-1">
                  <path d="M 65 82 A 75 32 0 0 0 215 82 v 18 A 75 32 0 0 1 65 100 Z" fill="url(#cylinderSideGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  <ellipse cx="140" cy="82" rx="75" ry="32" fill="#14191e" stroke="url(#discRimTop)" strokeWidth="1.6" />

                  {/* Concentric Precision Tracks */}
                  <ellipse cx="140" cy="82" rx="58" ry="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <ellipse cx="140" cy="82" rx="42" ry="18" fill="none" stroke="rgba(128,221,209,0.6)" strokeWidth="1.2" strokeDasharray="5 3" className="animate-[spin_18s_linear_infinite] origin-[140px_82px]" />

                  {/* Radial Rotating Radar Sweep Beam */}
                  <path 
                    d="M 140 82 L 195 72 A 58 25 0 0 1 180 98 Z" 
                    fill="url(#scannerSweep)" 
                    className="origin-[140px_82px] animate-[spin_6s_linear_infinite]"
                  />

                  {/* Core Aperture Disc */}
                  <ellipse cx="140" cy="82" rx="24" ry="10" fill="#080c0e" stroke="#80ddd1" strokeWidth="1.5" />
                  
                  {/* Glowing Core Center Node */}
                  <ellipse cx="140" cy="82" rx="8" ry="3.5" fill="#80ddd1" className="animate-pulse" />
                  <ellipse cx="140" cy="82" rx="14" ry="6" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 2" />
                </g>

                {/* Vertical Laser Axis Telemetry Pillar */}
                <line x1="140" y1="38" x2="140" y2="82" stroke="url(#axisLaser)" strokeWidth="2" strokeDasharray="3 2" className="animate-pulse" />
                <circle cx="140" cy="36" r="3.5" fill="#ffffff" stroke="#80ddd1" strokeWidth="1.5" className="shadow-[0_0_10px_#80ddd1]" />

                {/* Orbiting Satellite Data Packet */}
                <g className="origin-[140px_82px] animate-[spin_10s_linear_infinite]">
                  <circle cx="218" cy="82" r="2.5" fill="#80ddd1" />
                  <line x1="218" y1="82" x2="225" y2="78" stroke="#80ddd1" strokeWidth="0.8" strokeDasharray="1 1" />
                </g>
              </svg>
            </div>

            {/* Typography */}
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              Purpose-built
            </h3>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed mb-6">
              Stack &amp; Scale is shaped by zero-trust isolation and 100% data custody. Sovereign software running directly on your edge hardware and private VPC.
            </p>
          </div>

          {/* Linear Technical Specs Footer */}
          <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-[11px] font-mono text-zinc-400">
            <div>
              <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">CUSTODY</span>
              <span className="text-zinc-200 font-medium">100% Private VPC</span>
            </div>
            <div>
              <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">ENCRYPTION</span>
              <span className="text-teal-300 font-medium">AES-256 GCM</span>
            </div>
          </div>
        </article>

        {/* =========================================================================
            FIG 0.2 - POWERED BY AGENTS (Distributed Multi-Agent Mesh & Orchestration)
            ========================================================================= */}
        <article 
          className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/50 via-zinc-950/70 to-black p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.12),inset_0_1px_0_0_rgba(255,255,255,0.15)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_40px_-15px_rgba(0,0,0,0.8)] spotlight-card"
          onMouseMove={handleCardSpotlight}
          onMouseEnter={() => setHoveredFig(2)}
          onMouseLeave={() => setHoveredFig(null)}
        >
          <div>
            {/* Monospace Header Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-6">
              <span className="font-mono text-xs font-semibold tracking-widest text-zinc-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
                FIG 0.2
              </span>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/[0.08]">
                MULTI-AGENT MESH
              </span>
            </div>

            {/* Technical Viewport Stage */}
            <div className="w-full h-60 rounded-xl bg-zinc-950/90 border border-white/[0.06] relative mb-6 overflow-hidden flex items-center justify-center select-none shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
              {/* Technical Dot Grid Backdrop */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
                  backgroundSize: "16px 16px"
                }}
              />

              {/* Corner Crosshairs */}
              <span className="absolute top-2 left-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute top-2 right-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute bottom-2 left-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute bottom-2 right-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>

              {/* Telemetry Coordinate HUD */}
              <div className="absolute top-2.5 left-6 text-[9px] font-mono text-zinc-500 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                <span>ROUTING: AUTONOMOUS</span>
              </div>
              <div className="absolute bottom-2.5 right-6 text-[9px] font-mono text-zinc-500 tracking-wider">
                <span>MESH // 0.8ms</span>
              </div>

              {/* Ambient Radiant Core Glow */}
              <div className="absolute w-36 h-36 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-colors duration-500" />

              {/* High-Craft Linear SVG Diagram */}
              <svg 
                viewBox="0 0 280 220" 
                className="w-full h-full max-w-[260px] overflow-visible transition-transform duration-500 group-hover:scale-105"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="cubeTopGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#282a3d" />
                    <stop offset="100%" stopColor="#141520" />
                  </linearGradient>

                  <linearGradient id="cubeTopGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#313554" />
                    <stop offset="100%" stopColor="#181a2b" />
                  </linearGradient>

                  <linearGradient id="cubeTopGradBright" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b4270" />
                    <stop offset="50%" stopColor="#262b48" />
                    <stop offset="100%" stopColor="#141727" />
                  </linearGradient>

                  <linearGradient id="laserMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#80ddd1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Floor Mesh Connection Netting */}
                <path d="M 60 170 L 140 120 L 220 170 L 140 210 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="140" y1="120" x2="140" y2="210" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="3 3" />

                {/* Back-Left Node Cube (Medium Elevation) */}
                <g className="transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  {/* Top Face */}
                  <polygon points="75,60 110,40 145,60 110,80" fill="url(#cubeTopGrad1)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                  {/* Left Face */}
                  <polygon points="75,60 110,80 110,125 75,105" fill="#0c0d14" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                  {/* Right Face */}
                  <polygon points="110,80 145,60 145,105 110,125" fill="#0f1019" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                  {/* Top Holographic Crosshair */}
                  <line x1="92" y1="50" x2="128" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                  <circle cx="110" cy="60" r="2.5" fill="#818cf8" />
                </g>

                {/* Back-Right Tall Pillar Cube (Coordinator Node) */}
                <g className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  {/* Top Face */}
                  <polygon points="145,50 185,26 225,50 185,74" fill="url(#cubeTopGrad2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  {/* Left Face */}
                  <polygon points="145,50 185,74 185,140 145,116" fill="#0e0f18" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                  {/* Right Face */}
                  <polygon points="185,74 225,50 225,116 185,140" fill="#131422" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                  {/* Top Glowing Laser Reticle */}
                  <circle cx="185" cy="50" r="10" fill="none" stroke="rgba(129,140,248,0.4)" strokeWidth="1" strokeDasharray="3 2" />
                  <circle cx="185" cy="50" r="3" fill="#ffffff" stroke="#818cf8" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* Front-Left Primary Agent Node (Wide Glassmorphic Cube) */}
                <g className="transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1">
                  {/* Top Face */}
                  <polygon points="45,100 95,72 145,100 95,128" fill="url(#cubeTopGradBright)" stroke="rgba(255,255,255,0.65)" strokeWidth="1.4" />
                  {/* Left Face */}
                  <polygon points="45,100 95,128 95,170 45,142" fill="#10111a" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />
                  {/* Right Face */}
                  <polygon points="95,128 145,100 145,142 95,170" fill="#161726" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />

                  {/* Wireframe Internal Subdivision */}
                  <line x1="70" y1="86" x2="120" y2="114" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
                  <line x1="70" y1="114" x2="120" y2="86" stroke="rgba(129,140,248,0.5)" strokeWidth="0.8" />

                  {/* Top Luminous Edge Highlight */}
                  <line x1="45" y1="100" x2="95" y2="128" stroke="#ffffff" strokeWidth="1.8" />
                  <circle cx="95" cy="100" r="3" fill="#818cf8" />
                </g>

                {/* Front-Right Micro-Node Cube */}
                <g className="transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1">
                  {/* Top Face */}
                  <polygon points="135,120 170,100 205,120 170,140" fill="url(#cubeTopGradBright)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                  {/* Left Face */}
                  <polygon points="135,120 170,140 170,175 135,155" fill="#11121d" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  {/* Right Face */}
                  <polygon points="170,140 205,120 205,155 170,175" fill="#171827" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <circle cx="170" cy="120" r="2.5" fill="#80ddd1" />
                </g>

                {/* Inter-Agent Fiber-Optic Telemetry Channels */}
                <path 
                  d="M 95 100 L 110 60 L 185 50 L 170 120 Z" 
                  fill="none" 
                  stroke="url(#laserMeshGrad)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 3" 
                />

                {/* High-Velocity Traveling Data Pulses */}
                <circle cx="140" cy="55" r="3.5" fill="#ffffff" stroke="#818cf8" strokeWidth="1" className="animate-ping" />
                <circle cx="132" cy="110" r="2.5" fill="#80ddd1" className="animate-pulse" />

                {/* Floating Node Status Badge */}
                <g transform="translate(195, 30)">
                  <rect width="65" height="18" rx="4" fill="#080910" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <circle cx="8" cy="9" r="2" fill="#818cf8" />
                  <text x="16" y="12" fill="#a5b4fc" fontSize="8" fontFamily="monospace">AGENT_SYNC</text>
                </g>
              </svg>
            </div>

            {/* Typography */}
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              Powered by agents
            </h3>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed mb-6">
              Designed for workflows shared by humans and automated pipelines. Continuous offline-to-cloud synchronization and autonomous event dispatch across edge nodes.
            </p>
          </div>

          {/* Linear Technical Specs Footer */}
          <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-[11px] font-mono text-zinc-400">
            <div>
              <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">DISPATCH</span>
              <span className="text-zinc-200 font-medium">&lt;0.8ms Event</span>
            </div>
            <div>
              <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">TOPOLOGY</span>
              <span className="text-indigo-300 font-medium">Peer-to-Peer Mesh</span>
            </div>
          </div>
        </article>

        {/* =========================================================================
            FIG 0.3 - DESIGNED FOR SPEED (Sub-5ms Execution Engine & Velocity Fins)
            ========================================================================= */}
        <article 
          className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/50 via-zinc-950/70 to-black p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-sky-500/30 hover:shadow-[0_0_40px_rgba(56,189,248,0.12),inset_0_1px_0_0_rgba(255,255,255,0.15)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_40px_-15px_rgba(0,0,0,0.8)] spotlight-card"
          onMouseMove={handleCardSpotlight}
          onMouseEnter={() => setHoveredFig(3)}
          onMouseLeave={() => setHoveredFig(null)}
        >
          <div>
            {/* Monospace Header Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-6">
              <span className="font-mono text-xs font-semibold tracking-widest text-zinc-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                FIG 0.3
              </span>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/[0.08]">
                VELOCITY ENGINE
              </span>
            </div>

            {/* Technical Viewport Stage */}
            <div className="w-full h-60 rounded-xl bg-zinc-950/90 border border-white/[0.06] relative mb-6 overflow-hidden flex items-center justify-center select-none shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
              {/* Technical Dot Grid Backdrop */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
                  backgroundSize: "16px 16px"
                }}
              />

              {/* Corner Crosshairs */}
              <span className="absolute top-2 left-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute top-2 right-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute bottom-2 left-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>
              <span className="absolute bottom-2 right-2 text-zinc-700 font-mono text-[9px] pointer-events-none select-none">+</span>

              {/* Telemetry Coordinate HUD */}
              <div className="absolute top-2.5 left-6 text-[9px] font-mono text-zinc-500 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-sky-400 animate-pulse" />
                <span>BENCHMARK: 18.4K TPS</span>
              </div>
              <div className="absolute bottom-2.5 right-6 text-[9px] font-mono text-zinc-500 tracking-wider">
                <span>P99 // 1.84ms</span>
              </div>

              {/* Ambient Radiant Core Glow */}
              <div className="absolute w-36 h-36 rounded-full bg-sky-500/15 blur-2xl pointer-events-none group-hover:bg-sky-500/25 transition-colors duration-500" />

              {/* High-Craft Linear SVG Diagram */}
              <svg 
                viewBox="0 0 280 220" 
                className="w-full h-full max-w-[260px] overflow-visible transition-transform duration-500 group-hover:scale-105"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="speedFinGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#0a0c12" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#151b26" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#25354a" stopOpacity="0.95" />
                  </linearGradient>

                  <linearGradient id="vectorBeam" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                    <stop offset="70%" stopColor="#80ddd1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                  </linearGradient>

                  <linearGradient id="apexLaser" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>

                {/* Baseline Calibration Horizontal Track */}
                <line x1="30" y1="185" x2="250" y2="185" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {[45, 80, 115, 150, 185, 220].map((tickX, i) => (
                  <line key={i} x1={tickX} y1="182" x2={tickX} y2="188" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                ))}

                {/* Precision Stepped Velocity Fins (Exponential Stacking) */}
                {[
                  { x: 45, y: 172, h: 16, op: 0.35, color: "rgba(255,255,255,0.3)" },
                  { x: 58, y: 165, h: 24, op: 0.4, color: "rgba(255,255,255,0.35)" },
                  { x: 71, y: 158, h: 33, op: 0.45, color: "rgba(255,255,255,0.4)" },
                  { x: 84, y: 151, h: 43, op: 0.5, color: "rgba(255,255,255,0.45)" },
                  { x: 97, y: 144, h: 54, op: 0.55, color: "rgba(255,255,255,0.5)" },
                  { x: 110, y: 137, h: 66, op: 0.6, color: "rgba(255,255,255,0.55)" },
                  { x: 123, y: 130, h: 79, op: 0.65, color: "rgba(255,255,255,0.6)" },
                  { x: 136, y: 123, h: 93, op: 0.7, color: "rgba(128,221,209,0.7)" },
                  { x: 149, y: 116, h: 108, op: 0.75, color: "rgba(128,221,209,0.8)" },
                  { x: 162, y: 109, h: 124, op: 0.82, color: "rgba(56,189,248,0.85)" },
                  { x: 175, y: 102, h: 141, op: 0.9, color: "rgba(56,189,248,0.95)" },
                  { x: 188, y: 95, h: 159, op: 0.95, color: "#80ddd1" },
                  { x: 201, y: 88, h: 178, op: 1.0, color: "#ffffff" },
                ].map((fin, i) => {
                  const xTop = fin.x + 36;
                  const yTop = fin.y - 19;
                  const isApex = i >= 11;
                  return (
                    <g key={i} className="transition-all duration-300 group-hover:brightness-110">
                      {/* Isometric Fin Slab */}
                      <path
                        d={`M ${fin.x} ${fin.y} L ${fin.x} ${fin.y - fin.h} L ${xTop} ${yTop - fin.h} L ${xTop} ${yTop} Z`}
                        fill="url(#speedFinGrad)"
                        stroke={isApex ? "#38bdf8" : `rgba(255, 255, 255, ${fin.op * 0.4})`}
                        strokeWidth={isApex ? "1.2" : "0.8"}
                      />

                      {/* Luminous Razor-Sharp Top Edge with High-End Linear Rim Lighting */}
                      <line
                        x1={fin.x}
                        y1={fin.y - fin.h}
                        x2={xTop}
                        y2={yTop - fin.h}
                        stroke={fin.color}
                        strokeWidth={isApex ? "2.2" : "1.2"}
                      />

                      {/* Vertical Leading Edge Highlight */}
                      <line
                        x1={fin.x}
                        y1={fin.y}
                        x2={fin.x}
                        y2={fin.y - fin.h}
                        stroke={isApex ? "url(#apexLaser)" : "rgba(255,255,255,0.2)"}
                        strokeWidth={isApex ? "1.5" : "0.6"}
                      />
                    </g>
                  );
                })}

                {/* Supersonic Trajectory Vector Beam */}
                <line 
                  x1="35" 
                  y1="180" 
                  x2="246" 
                  y2="52" 
                  stroke="url(#vectorBeam)" 
                  strokeWidth="2" 
                  strokeDasharray="6 4" 
                  className="animate-pulse"
                />

                {/* Traveling Velocity Pulse Particle */}
                <circle cx="237" cy="58" r="4" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" className="animate-ping" />
                <circle cx="237" cy="58" r="2.5" fill="#38bdf8" />

                {/* Speed Metric Overlay Callout */}
                <g transform="translate(165, 25)">
                  <rect width="70" height="20" rx="4" fill="#080c14" stroke="#38bdf8" strokeWidth="1" />
                  <text x="8" y="13.5" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">&lt;0.8ms</text>
                  <text x="44" y="13.5" fill="#80ddd1" fontSize="8" fontFamily="monospace">DISP</text>
                </g>
              </svg>
            </div>

            {/* Typography */}
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              Designed for speed
            </h3>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed mb-6">
              Reduces noise and restores momentum. Sub-5ms local SQLite operations, instant background delta queues, and 99.999% fault-tolerant execution.
            </p>
          </div>

          {/* Linear Technical Specs Footer */}
          <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-[11px] font-mono text-zinc-400">
            <div>
              <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">THROUGHPUT</span>
              <span className="text-zinc-200 font-medium">18.4k Ops/sec</span>
            </div>
            <div>
              <span className="text-zinc-600 block text-[9px] uppercase tracking-wider">LOCAL LATENCY</span>
              <span className="text-sky-300 font-medium">&lt;1.84ms Median</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
