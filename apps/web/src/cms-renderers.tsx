import type { CmsDocument } from "./cms-content";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function entries(value: unknown): readonly UnknownRecord[] {
  return Array.isArray(value)
    ? value.map(record).filter((item): item is UnknownRecord => item !== null)
    : [];
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(" ");
  const node = record(value);
  if (!node) return "";
  return `${typeof node.text === "string" ? node.text : ""} ${text(node.children)}`.trim();
}

function stringValue(item: UnknownRecord, key: string): string | null {
  return typeof item[key] === "string" ? item[key] : null;
}

export type FaqEntry = Readonly<{ question: string; answer: string }>;

export function pageFaqs(document: CmsDocument): readonly FaqEntry[] {
  return entries(document.layout).flatMap((block) => {
    if (stringValue(block, "blockType") !== "faqBlock") return [];
    return [...entries(block.faqs), ...entries(block.items)].flatMap((item) => {
      const question = stringValue(item, "question");
      const answer = stringValue(item, "answer");
      return question && answer ? [{ question, answer }] : [];
    });
  });
}

function relatedDocuments(value: unknown): readonly CmsDocument[] {
  return entries(value).filter(
    (item): item is CmsDocument =>
      typeof item.id === "string" || typeof item.id === "number",
  );
}

export function CmsDetailSections({
  document,
}: Readonly<{ document: CmsDocument }>) {
  const richSections = [
    "overview",
    "description",
    "summary",
    "challenge",
    "approach",
    "outcome",
    "body",
  ]
    .map((key) => ({ key, value: text(document[key]) }))
    .filter((section) => section.value.length > 0);
  const features = entries(document.features);
  const deliverables = entries(document.deliverables);
  const metrics = entries(document.metrics ?? document.stats);
  const screenshots = entries(document.interfaceShowcase)
    .map((item) => record(item.screenshot))
    .filter(
      (image): image is UnknownRecord =>
        image !== null && typeof image.url === "string",
    );
  const related = [
    {
      label: "Products",
      path: "/products",
      documents: relatedDocuments(document.relatedProducts),
    },
    {
      label: "Services",
      path: "/services",
      documents: relatedDocuments(
        document.relatedServices ?? document.servicesDelivered,
      ),
    },
    {
      label: "Industries",
      path: "/industries",
      documents: relatedDocuments(document.relatedIndustries),
    },
  ].filter((group) => group.documents.length > 0);

  return (
    <div className="cms-detail-sections">
      {richSections.map((section) => (
        <p key={section.key}>{section.value}</p>
      ))}
      {features.length > 0 ? (
        <section>
          <h2>What it includes</h2>
          <ul>
            {features.map((feature, index) => (
              <li
                key={`${stringValue(feature, "title") ?? "feature"}-${index}`}
              >
                <strong>{stringValue(feature, "title")}</strong>
                {stringValue(feature, "description")
                  ? ` — ${stringValue(feature, "description")}`
                  : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {deliverables.length > 0 ? (
        <section>
          <h2>Deliverables</h2>
          <ul>
            {deliverables.map((item, index) => (
              <li
                key={`${stringValue(item, "deliverable") ?? "deliverable"}-${index}`}
              >
                {stringValue(item, "deliverable")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {metrics.length > 0 ? (
        <section className="metric-list" aria-label="Published metrics">
          {metrics.map((item, index) => (
            <div key={`${stringValue(item, "label") ?? "metric"}-${index}`}>
              <strong>{stringValue(item, "value")}</strong>
              <span>{stringValue(item, "label")}</span>
            </div>
          ))}
        </section>
      ) : null}
      {screenshots.length > 0 ? (
        <section>
          <h2>Inside the interface</h2>
          <div className="interface-gallery">
            {screenshots.map((image, index) => (
              <img
                alt={
                  stringValue(image, "alt") ?? "Product interface screenshot"
                }
                key={`${stringValue(image, "url")}-${index}`}
                src={stringValue(image, "url") ?? ""}
              />
            ))}
          </div>
        </section>
      ) : null}
      {related.map((group) => (
        <section key={group.label}>
          <h2>Related {group.label.toLowerCase()}</h2>
          <div className="related-links">
            {group.documents.map((relatedDocument) => (
              <a
                href={`${group.path}/${relatedDocument.slug ?? relatedDocument.id}`}
                key={String(relatedDocument.id)}
              >
                {relatedDocument.title ??
                  relatedDocument.slug ??
                  "View related content"}{" "}
                <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CmsPageBlocks({
  document,
}: Readonly<{ document: CmsDocument }>) {
  const blocks = entries(document.layout);
  if (blocks.length === 0) return null;
  return (
    <div className="cms-blocks">
      {blocks.map((block, index) => {
        const type = stringValue(block, "blockType");
        if (type === "hero")
          return (
            <section className="cms-hero" key={index}>
              <p className="eyebrow">{stringValue(block, "eyebrow")}</p>
              <h2>{stringValue(block, "heading")}</h2>
              <p>{stringValue(block, "subheading")}</p>
            </section>
          );
        if (type === "featureGroup")
          return (
            <section className="cms-feature-group" key={index}>
              <h2>{stringValue(block, "heading")}</h2>
              <div>
                {entries(block.items).map((item, itemIndex) => (
                  <article key={itemIndex}>
                    <h3>{stringValue(item, "title")}</h3>
                    <p>{stringValue(item, "description")}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        if (type === "process")
          return (
            <section className="cms-process" key={index}>
              <h2>{stringValue(block, "heading")}</h2>
              <ol>
                {entries(block.steps).map((step, stepIndex) => (
                  <li key={stepIndex}>
                    <strong>{stringValue(step, "title")}</strong>
                    <p>{stringValue(step, "description")}</p>
                  </li>
                ))}
              </ol>
            </section>
          );
        if (type === "cta")
          return (
            <section className="cms-cta" key={index}>
              <h2>{stringValue(block, "heading")}</h2>
              <p>{stringValue(block, "body")}</p>
              <Button
                render={
                  <a href={stringValue(block, "buttonUrl") ?? "/contact"} />
                }
              >
                {stringValue(block, "buttonLabel") ?? "Contact us"}
              </Button>
            </section>
          );
        if (type === "faqBlock") {
          const faqs = [
            ...entries(block.faqs),
            ...entries(block.items),
          ].flatMap((item) => {
            const question = stringValue(item, "question");
            const answer = stringValue(item, "answer");
            return question && answer ? [{ question, answer }] : [];
          });
          return faqs.length > 0 ? (
            <section className="cms-faq" key={index}>
              <h2>
                {stringValue(block, "heading") ?? "Frequently asked questions"}
              </h2>
              <Accordion>
                {faqs.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p>{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ) : null;
        }
        if (type === "richText")
          return (
            <section className="cms-rich-text" key={index}>
              <p>{text(block.content)}</p>
            </section>
          );
        if (type === "metricGroup")
          return (
            <section className="cms-metric-group my-12" key={index}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {entries(block.items).map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                      {stringValue(item, "value")}
                      {stringValue(item, "suffix")}
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 font-medium">
                      {stringValue(item, "label")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        if (type === "testimonialGroup")
          return (
            <section className="cms-testimonial-group my-12" key={index}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {entries(block.items).map((item, itemIndex) => (
                  <blockquote
                    key={itemIndex}
                    className="p-6 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm flex flex-col justify-between"
                  >
                    <p className="text-sm sm:text-base text-neutral-300 italic leading-relaxed">
                      &ldquo;{stringValue(item, "quote")}&rdquo;
                    </p>
                    <footer className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <cite className="not-italic font-semibold text-white text-sm block">
                          {stringValue(item, "authorName")}
                        </cite>
                        {stringValue(item, "authorRole") && (
                          <span className="text-xs text-neutral-400">
                            {stringValue(item, "authorRole")}
                          </span>
                        )}
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>
          );
        if (type === "productShowcase") {
          const product = record(block["product"]);
          const title = product
            ? stringValue(product, "title")
            : stringValue(block, "headline");
          const summary = product ? stringValue(product, "summary") : null;
          const slug = product ? stringValue(product, "slug") : null;
          return (
            <section
              className="cms-product-showcase my-12 p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent text-center"
              key={index}
            >
              {stringValue(block, "headline") && (
                <p className="text-xs uppercase font-mono tracking-widest text-blue-400 mb-2">
                  Featured Product
                </p>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {title}
              </h2>
              {summary && (
                <p className="text-neutral-300 max-w-2xl mx-auto mb-6 text-sm sm:text-base">
                  {summary}
                </p>
              )}
              {slug && (
                <Button render={<a href={`/products/${slug}`} />}>
                  Explore Product →
                </Button>
              )}
            </section>
          );
        }
        if (type === "mediaBlock") {
          const media = record(block["media"]);
          const url = media ? stringValue(media, "url") : null;
          const alt = media
            ? stringValue(media, "alt")
            : stringValue(block, "caption");
          if (!url) return null;
          return (
            <figure className="cms-media-block my-10 text-center" key={index}>
              <img
                src={url}
                alt={alt ?? ""}
                className="rounded-xl border border-white/10 max-h-[500px] w-auto mx-auto object-cover"
              />
              {stringValue(block, "caption") && (
                <figcaption className="mt-2 text-xs text-neutral-400 font-mono">
                  {stringValue(block, "caption")}
                </figcaption>
              )}
            </figure>
          );
        }
        return null;
      })}
    </div>
  );
}
