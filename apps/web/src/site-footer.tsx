"use client";

import * as React from "react";
import { StackAndScaleLogo } from "./brand-logo";

export function SiteFooter() {
  const [isStaff, setIsStaff] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/session")
      .then((res) =>
        res.ok ? (res.json() as Promise<{ authenticated?: boolean }>) : null,
      )
      .then((data: { authenticated?: boolean } | null) => {
        if (isMounted && data?.authenticated) {
          setIsStaff(true);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050505] text-zinc-400">
      {/* Main Footer Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 sm:gap-x-8 gap-y-10 pb-12 border-b border-white/[0.06]">
          {/* Brand & Mission Column (spans 2 cols on mobile, 4 on tablet, 2 on desktop) */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 flex flex-col gap-4">
            <a
              href="/"
              className="inline-block mb-1"
              aria-label="Stack & Scale home"
            >
              <StackAndScaleLogo size={24} textClassName="text-[17px]" />
            </a>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              High-performance software and autonomous operational systems.
              Engineered for total data custody, zero vendor lock-in, and
              sub-second execution.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit max-w-full">
                <span
                  className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[10.5px] sm:text-xs font-mono tracking-tight whitespace-nowrap">
                  ALL SYSTEMS OPERATIONAL · 99.999% SLA
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500">
                14 Edge PoPs Online · iad1, sfo1, cdg1, sin1
              </p>
            </div>
          </div>

          {/* Column 1: Products */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
              Software
            </span>
            <ul className="flex flex-col gap-1.5 text-xs text-zinc-400">
              <li>
                <a
                  href="/products/retail-operations"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Retail POS Suite
                </a>
              </li>
              <li>
                <a
                  href="/products/workflow-hub"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Workflow Hub
                </a>
              </li>
              <li>
                <a
                  href="/products/operating-insight"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Operating Insight
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="py-1 block hover:text-white transition-colors text-teal-400 font-medium"
                >
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
            <ul className="flex flex-col gap-1.5 text-xs text-zinc-400">
              <li>
                <a
                  href="/services/product-discovery"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Product Discovery
                </a>
              </li>
              <li>
                <a
                  href="/services/experience-design"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Experience Design
                </a>
              </li>
              <li>
                <a
                  href="/services/delivery-partnership"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Delivery Partnership
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="py-1 block hover:text-white transition-colors text-teal-400 font-medium"
                >
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
            <ul className="flex flex-col gap-1.5 text-xs text-zinc-400">
              <li>
                <a
                  href="/industries/retail"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Retail &amp; Commerce
                </a>
              </li>
              <li>
                <a
                  href="/industries/professional-services"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Professional Services
                </a>
              </li>
              <li>
                <a
                  href="/industries/field-operations"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Field Operations
                </a>
              </li>
              <li>
                <a
                  href="/industries"
                  className="py-1 block hover:text-white transition-colors text-teal-400 font-medium"
                >
                  Industry Focus →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform (Public Only by Default) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
                Platform
              </span>
              {isStaff && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  STAFF
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-1.5 text-xs text-zinc-400">
              {/* Public links always shown to everyone */}
              <li>
                <a
                  href="/#architecture"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Architecture &amp; Specs
                </a>
              </li>
              <li>
                <a
                  href="/approach"
                  className="py-1 block hover:text-white transition-colors"
                >
                  Sovereign Cloud
                </a>
              </li>
              <li>
                <a
                  href="/health"
                  className="py-1 block hover:text-white transition-colors"
                >
                  System Health
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="py-1 block hover:text-white transition-colors text-white font-semibold"
                >
                  Contact Us →
                </a>
              </li>

              {/* Private employee/staff links: ONLY visible when authenticated as staff */}
              {isStaff && (
                <>
                  <li className="pt-2.5 mt-1 border-t border-white/[0.08]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
                      Private Portals
                    </span>
                  </li>
                  <li>
                    <a
                      href="/admin"
                      className="hover:text-emerald-300 text-zinc-300 transition-colors flex items-center gap-1.5 py-1"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                      Admin &amp; CMS Console
                    </a>
                  </li>
                  <li>
                    <a
                      href="/staff/leads"
                      className="hover:text-emerald-300 text-zinc-300 transition-colors flex items-center gap-1.5 py-1"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                      Staff CRM &amp; Leads
                    </a>
                  </li>
                  <li>
                    <a
                      href="/portal/demo"
                      className="hover:text-emerald-300 text-zinc-300 transition-colors flex items-center gap-1.5 py-1"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                      Client Project Portal
                    </a>
                  </li>
                  <li>
                    <a
                      href="/account/demo"
                      className="hover:text-emerald-300 text-zinc-300 transition-colors flex items-center gap-1.5 py-1"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                      Sovereign Account
                    </a>
                  </li>
                  <li className="pt-1">
                    <a
                      href="/api/auth/logout"
                      className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors py-1 block"
                    >
                      Sign Out (Staff)
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Compliance & Quick Actions */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-zinc-400">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
            <span>
              &copy; {new Date().getFullYear()}{" "}Stack &amp; Scale Technologies. All rights reserved.
            </span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap w-fit px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.08] font-mono text-[10px] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" aria-hidden="true" />
              SOC 2 TYPE II · OIDC 2.0 PKCE · AES-256 GCM
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <a
              href="/resources"
              className="py-1 hover:text-white transition-colors"
            >
              Resources
            </a>
            <a
              href="/privacy"
              className="py-1 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="py-1 hover:text-white transition-colors"
            >
              Terms
            </a>
            <a
              href="/cookies"
              className="py-1 hover:text-white transition-colors"
            >
              Cookies
            </a>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-cookie-settings"));
                }
              }}
              className="py-1 hover:text-white transition-colors cursor-pointer text-left"
            >
              Consent Settings
            </button>
            <span className="hidden md:inline text-zinc-700">|</span>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="py-1 text-zinc-400 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
              aria-label="Scroll to top of page"
            >
              <span>Back to top</span>
              <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
