import * as React from "react";

export type LogoVariant = "strata" | "default";

export type StackAndScaleIconProps = {
  size?: number;
  variant?: LogoVariant;
  className?: string;
};

/**
 * Stack & Scale Flagship Logomark — The Ascending Strata
 *
 * Three precision horizontal bars ascending diagonally (↗).
 * Each bar shifts right by 18 and up by 25 — a mathematically
 * consistent diagonal rhythm across a 100×100 grid.
 *
 * Bar widths are uniform (48). Heights increase subtly
 * (12 → 13 → 14) to create visual weight progression from
 * foundation to apex.
 *
 * Monochrome only — opacity tiers convey depth:
 *   Layer 1 (0.35) → Foundation / Stack
 *   Layer 2 (0.60) → Platform Core
 *   Layer 3 (1.00) → Scale Apex
 */
export function StackAndScaleIcon({
  size = 22,
  className = "",
}: StackAndScaleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Layer 1: Foundation (Stack) — bottom-left */}
      <rect
        x="8"
        y="72"
        width="48"
        height="12"
        rx="3"
        fill="currentColor"
        fillOpacity="0.35"
      />
      {/* Layer 2: Platform Core — center */}
      <rect
        x="26"
        y="47"
        width="48"
        height="13"
        rx="3"
        fill="currentColor"
        fillOpacity="0.6"
      />
      {/* Layer 3: Scale Apex — top-right */}
      <rect x="44" y="22" width="48" height="14" rx="3" fill="currentColor" />
    </svg>
  );
}

export type StackAndScaleLogoProps = {
  size?: number;
  iconOnly?: boolean;
  variant?: LogoVariant;
  className?: string;
  textClassName?: string;
  badge?: string;
};

export function StackAndScaleLogo({
  size = 23,
  iconOnly = false,
  variant = "strata",
  className = "",
  textClassName = "",
  badge,
}: StackAndScaleLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="Stack & Scale"
    >
      <StackAndScaleIcon size={size} variant={variant} />
      {!iconOnly && (
        <span
          style={{
            fontFamily:
              'var(--font-brand), var(--font-brand-sans), var(--font-geist-sans), "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11", "ss01"',
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
          className={`font-bold tracking-[-0.03em] text-white flex items-center leading-none text-[17px] antialiased ${textClassName}`}
        >
          <span className="font-bold tracking-[-0.025em] text-white">
            Stack
          </span>
          <span className="text-white/50 font-medium mx-[3.5px] text-[0.88em] inline-block -translate-y-[0.5px]">
            &amp;
          </span>
          <span className="font-bold tracking-[-0.025em] text-white">
            Scale
          </span>
          {badge && (
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-normal bg-white/10 text-neutral-300 border border-white/15">
              {badge}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
