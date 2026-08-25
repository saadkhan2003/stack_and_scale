import type { Block } from "payload";

import { cta } from "./cta.js";
import { faqBlock } from "./faq-block.js";
import { featureGroup } from "./feature-group.js";
import { gallery } from "./gallery.js";
import { hero } from "./hero.js";
import { mediaBlock } from "./media-block.js";
import { metricGroup } from "./metric-group.js";
import { process } from "./process.js";
import { productShowcase } from "./product-showcase.js";
import { relatedContent } from "./related-content.js";
import { richText } from "./rich-text.js";
import { testimonialGroup } from "./testimonial-group.js";
import { videoEmbed } from "./video-embed.js";

export {
  cta,
  faqBlock,
  featureGroup,
  gallery,
  hero,
  mediaBlock,
  metricGroup,
  process,
  productShowcase,
  relatedContent,
  richText,
  testimonialGroup,
  videoEmbed,
};

export const allBlocks: Block[] = [
  hero,
  richText,
  featureGroup,
  metricGroup,
  testimonialGroup,
  mediaBlock,
  gallery,
  videoEmbed,
  productShowcase,
  process,
  faqBlock,
  relatedContent,
  cta,
];
