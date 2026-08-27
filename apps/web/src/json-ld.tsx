import type { ReactNode } from "react";

export function JsonLd({
  data,
}: Readonly<{ data: Record<string, unknown> }>): ReactNode {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
