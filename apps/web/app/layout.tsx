import type { Metadata } from "next";
import type { ReactNode } from "react";

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
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
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
