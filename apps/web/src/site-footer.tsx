export function SiteFooter() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050505] text-zinc-400">
      {/* Main Footer Container */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand & Mission Column (spans 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <a href="/" className="inline-block mb-1" aria-label="Stack & Scale Technologies home">
              <img
                src="/brand/stack-and-scale-logo-horizontal.png"
                alt="Stack & Scale Technologies"
                width={172}
                height={38}
                className="h-9 w-auto object-contain"
              />
            </a>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              High-performance software and autonomous operational systems. Engineered for total data custody, zero vendor lock-in, and sub-second execution.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 w-fit">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                <span>ALL SYSTEMS OPERATIONAL · 99.999% SLA</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                14 Edge PoPs Online · iad1, sfo1, cdg1, sin1
              </p>
            </div>
          </div>

          {/* Column 1: Products */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
              Software
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
              <li>
                <a href="/products/retail-operations" className="hover:text-white transition-colors">
                  Retail POS Suite
                </a>
              </li>
              <li>
                <a href="/products/workflow-hub" className="hover:text-white transition-colors">
                  Workflow Hub
                </a>
              </li>
              <li>
                <a href="/products/operating-insight" className="hover:text-white transition-colors">
                  Operating Insight
                </a>
              </li>
              <li>
                <a href="/products" className="hover:text-white transition-colors text-teal-400 font-medium">
                  All Products Catalog →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Services */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
              Services
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
              <li>
                <a href="/services/product-discovery" className="hover:text-white transition-colors">
                  Product Discovery
                </a>
              </li>
              <li>
                <a href="/services/experience-design" className="hover:text-white transition-colors">
                  Experience Design
                </a>
              </li>
              <li>
                <a href="/services/delivery-partnership" className="hover:text-white transition-colors">
                  Delivery Partnership
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-white transition-colors text-teal-400 font-medium">
                  All Services →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Industries */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
              Industries
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
              <li>
                <a href="/industries/retail" className="hover:text-white transition-colors">
                  Retail &amp; Commerce
                </a>
              </li>
              <li>
                <a href="/industries/professional-services" className="hover:text-white transition-colors">
                  Professional Services
                </a>
              </li>
              <li>
                <a href="/industries/field-operations" className="hover:text-white transition-colors">
                  Field Operations
                </a>
              </li>
              <li>
                <a href="/industries" className="hover:text-white transition-colors text-teal-400 font-medium">
                  Industry Focus →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Portal */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
              Platform
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-zinc-400">
              <li>
                <a href="/admin" className="hover:text-white transition-colors">
                  Admin &amp; CMS Console
                </a>
              </li>
              <li>
                <a href="/portal/demo" className="hover:text-white transition-colors">
                  Client Portal
                </a>
              </li>
              <li>
                <a href="/#architecture" className="hover:text-white transition-colors">
                  Architecture &amp; Specs
                </a>
              </li>
              <li>
                <a href="/health" className="hover:text-white transition-colors">
                  System Health
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors text-white font-semibold">
                  Contact Us →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-6">
            <span>&copy; {new Date().getFullYear()} Stack &amp; Scale Technologies. All rights reserved.</span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="font-mono text-[11px] text-zinc-400">
              SOC 2 TYPE II COMPLIANT · OIDC 2.0 PKCE · AES-256 GCM
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="/resources" className="hover:text-zinc-300 transition-colors">
              Resources
            </a>
            <a href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms
            </a>
            <a href="/cookies" className="hover:text-zinc-300 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
