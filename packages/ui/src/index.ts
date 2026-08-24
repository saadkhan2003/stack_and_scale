export const designTokens = {
  color: {
    brand: {
      night: "#0B1616",
      petrol: "#135D61",
      solar: "#F4C542",
      seafoam: "#80DDD1",
      sand: "#F5F2E8",
    },
    surface: {
      canvas: "#F5F2E8",
      inverse: "#0B1616",
      accent: "#80DDD1",
    },
    text: {
      primary: "#122323",
      inverse: "#F5F2E8",
      muted: "#5A6B69",
    },
  },
  radius: {
    card: "20px",
    control: "999px",
  },
  spacing: {
    compact: "8px",
    control: "16px",
    card: "24px",
    section: "112px",
  },
  border: {
    subtle: "1px solid rgba(11, 22, 22, 0.12)",
  },
  shadow: {
    card: "0 30px 60px rgba(11, 22, 22, 0.18)",
  },
  motion: {
    fast: "160ms",
    standard: "240ms",
    reduced: "0ms",
  },
  breakpoint: {
    compact: "520px",
    tablet: "880px",
  },
  zIndex: {
    content: 1,
    navigation: 10,
    dialog: 20,
    toast: 30,
  },
} as const;

export { contrastRatio } from "./contrast.js";

export type ButtonVariant = "primary" | "secondary";

export function getButtonClassName(variant: ButtonVariant): string {
  return `ss-button ss-button--${variant}`;
}
