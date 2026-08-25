import type { CmsDocument } from "./cms-content";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;
}

function entries(value: unknown): readonly UnknownRecord[] {
  return Array.isArray(value) ? value.map(record).filter((item): item is UnknownRecord => item !== null) : [];
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

export function CmsDetailSections({ document }: Readonly<{ document: CmsDocument }>) {
  const richSections = ["overview", "description", "summary", "challenge", "approach", "outcome", "body"]
    .map((key) => ({ key, value: text(document[key]) }))
    .filter((section) => section.value.length > 0);
  const features = entries(document.features);
  const deliverables = entries(document.deliverables);
  const metrics = entries(document.metrics ?? document.stats);

  return <div className="cms-detail-sections">
    {richSections.map((section) => <p key={section.key}>{section.value}</p>)}
    {features.length > 0 ? <section><h2>What it includes</h2><ul>{features.map((feature, index) => <li key={`${stringValue(feature, "title") ?? "feature"}-${index}`}><strong>{stringValue(feature, "title")}</strong>{stringValue(feature, "description") ? ` — ${stringValue(feature, "description")}` : ""}</li>)}</ul></section> : null}
    {deliverables.length > 0 ? <section><h2>Deliverables</h2><ul>{deliverables.map((item, index) => <li key={`${stringValue(item, "deliverable") ?? "deliverable"}-${index}`}>{stringValue(item, "deliverable")}</li>)}</ul></section> : null}
    {metrics.length > 0 ? <section className="metric-list" aria-label="Published metrics">{metrics.map((item, index) => <div key={`${stringValue(item, "label") ?? "metric"}-${index}`}><strong>{stringValue(item, "value")}</strong><span>{stringValue(item, "label")}</span></div>)}</section> : null}
  </div>;
}

export function CmsPageBlocks({ document }: Readonly<{ document: CmsDocument }>) {
  const blocks = entries(document.layout);
  if (blocks.length === 0) return null;
  return <div className="cms-blocks">{blocks.map((block, index) => {
    const type = stringValue(block, "blockType");
    if (type === "hero") return <section className="cms-hero" key={index}><p className="eyebrow">{stringValue(block, "eyebrow")}</p><h2>{stringValue(block, "heading")}</h2><p>{stringValue(block, "subheading")}</p></section>;
    if (type === "featureGroup") return <section className="cms-feature-group" key={index}><h2>{stringValue(block, "heading")}</h2><div>{entries(block.items).map((item, itemIndex) => <article key={itemIndex}><h3>{stringValue(item, "title")}</h3><p>{stringValue(item, "description")}</p></article>)}</div></section>;
    if (type === "process") return <section className="cms-process" key={index}><h2>{stringValue(block, "heading")}</h2><ol>{entries(block.steps).map((step, stepIndex) => <li key={stepIndex}><strong>{stringValue(step, "title")}</strong><p>{stringValue(step, "description")}</p></li>)}</ol></section>;
    if (type === "cta") return <section className="cms-cta" key={index}><h2>{stringValue(block, "heading")}</h2><p>{stringValue(block, "body")}</p><a className="button button-primary" href={stringValue(block, "buttonUrl") ?? "/contact"}>{stringValue(block, "buttonLabel") ?? "Contact us"}</a></section>;
    if (type === "richText") return <section className="cms-rich-text" key={index}><p>{text(block.content)}</p></section>;
    return null;
  })}</div>;
}
