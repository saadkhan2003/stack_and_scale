import type { Metadata } from "next";
import type { ReactNode } from "react";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Plus_Jakarta_Sans } from "next/font/google";

const brandFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-brand-sans",
  display: "swap",
});

import "./globals.css";
import { AnalyticsController } from "../src/analytics-controller";
import { JsonLd } from "../src/json-ld";
import { siteUrl } from "../src/seo";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    default: "Stack & Scale | Software for real operations",
    template: "%s | Stack & Scale",
  },
  description:
    "Purposeful products, services and delivery partnership for clearer operations.",
  metadataBase: siteUrl,
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/stack-and-scale-mark.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${brandFont.variable}`}
    >
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Stack & Scale",
            url: siteUrl.toString(),
          }}
        />
        <TooltipProvider>{children}</TooltipProvider>
        <AnalyticsController />
      </body>
    </html>
  );
}
