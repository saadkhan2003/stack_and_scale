import type { CanonicalPdfBrand } from "@stack-and-scale/storage";

const stackAndScaleBrand: CanonicalPdfBrand = {
  name: "Stack & Scale",
  // Matches the shared design-token "night" color (#0B1616).
  primaryRgb: [11, 22, 22],
};

export function documentBrand(
  environment: NodeJS.ProcessEnv = process.env,
): CanonicalPdfBrand {
  const configuredName = environment["DOCUMENT_BRAND_NAME"]?.trim();
  return configuredName
    ? { ...stackAndScaleBrand, name: configuredName }
    : stackAndScaleBrand;
}
