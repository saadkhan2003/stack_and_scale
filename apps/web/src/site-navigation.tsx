"use client";

import * as React from "react";
import { ArrowRight, ChevronDown, MenuIcon } from "lucide-react";
import {
  primaryNavigation,
  simpleNavItems,
  megaMenuConfig,
  automationNavItems,
  webDevNavItems,
  caseStudiesNavItems,
  productsNavItems,
  type MegaMenuSection,
} from "./navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavProps = {
  currentPath?: string | undefined;
};

export function SiteDesktopNav({ currentPath }: NavProps) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = React.useRef<HTMLDivElement | null>(null);

  const handleMouseEnter = (href: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (megaMenuConfig[href]) {
      setActiveMenu(href);
    } else {
      setActiveMenu(null);
    }
  };

  const handlePanelMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentSection: MegaMenuSection | undefined = activeMenu
    ? megaMenuConfig[activeMenu]
    : undefined;

  return (
    <div
      ref={navContainerRef}
      className="desktop-navigation-wrapper hidden md:flex items-center"
      onMouseLeave={handleMouseLeave}
    >
      {/* Desktop Main Navigation Bar - Simple Vercel Minimalist Aesthetic */}
      <nav aria-label="Main navigation" className="desktop-navigation flex items-center gap-6 lg:gap-7">
        {simpleNavItems.map((item) => {
          const hasMega = item.hasSubmenu && Boolean(megaMenuConfig[item.href]);
          const isOpen = activeMenu === item.href;
          const isCurrent = currentPath === item.href;

          return (
            <div
              key={item.label}
              className="relative flex items-center py-2"
              onMouseEnter={() => handleMouseEnter(item.href)}
            >
              <a
                href={item.href}
                className={cn(
                  "nav-top-link flex items-center gap-1 text-[14px] leading-none select-none tracking-normal transition-colors duration-150 py-1 font-normal",
                  isOpen || isCurrent
                    ? "text-white font-medium"
                    : "text-[#888888] hover:text-white",
                )}
                aria-current={isCurrent ? "page" : undefined}
                aria-expanded={hasMega ? isOpen : undefined}
                aria-haspopup={hasMega ? "menu" : undefined}
                onClick={() => {
                  if (hasMega && isOpen) {
                    setActiveMenu(null);
                  }
                }}
              >
                <span>{item.label}</span>
                {hasMega && (
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-[#777777] transition-transform duration-200 ease-out",
                      isOpen ? "rotate-180 text-white" : "group-hover:text-white",
                    )}
                    aria-hidden="true"
                  />
                )}
              </a>
            </div>
          );
        })}
      </nav>

      {/* Desktop Mega-Menu Dropdown Panel */}
      <div
        className={cn(
          "mega-menu-panel absolute top-full left-0 w-full bg-[#030303]/98 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.95)] transition-all duration-200 z-50 overflow-hidden",
          activeMenu
            ? "opacity-100 translate-y-0 pointer-events-auto visible max-h-[640px]"
            : "opacity-0 -translate-y-1.5 pointer-events-none invisible max-h-0",
        )}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="region"
        aria-label="Navigation sub-menu"
      >
        {/* Subtle top hairline */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {currentSection && (
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            {/* Header / Summary Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded">
                  {currentSection.navLabel}
                </span>
                <p className="text-xs text-neutral-400 font-normal">
                  {currentSection.summary}
                </p>
              </div>
              <a
                href={currentSection.navHref}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 group/all transition-colors font-medium"
                onClick={() => setActiveMenu(null)}
              >
                <span>View all {currentSection.navLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/all:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Categorized Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentSection.categories.map((category) => (
                <div key={category.id} className="flex flex-col gap-3">
                  {/* Category Title with badge counter */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.05]">
                    <h3 className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase font-mono">
                      {category.title}
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      0{category.items.length}
                    </span>
                  </div>
                  {category.summary && (
                    <p className="text-[11px] text-neutral-500 line-clamp-1">
                      {category.summary}
                    </p>
                  )}

                  {/* Sub-Menu Items */}
                  <div className="flex flex-col gap-1">
                    {category.items.map((subItem) => (
                      <a
                        key={subItem.title}
                        href={subItem.href}
                        className="group/item flex flex-col p-2.5 -mx-2.5 rounded-lg hover:bg-white/[0.05] transition-all duration-150"
                        onClick={() => setActiveMenu(null)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-neutral-200 group-hover/item:text-white transition-colors">
                            {subItem.title}
                          </span>
                          {subItem.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] border border-white/10 text-neutral-400 group-hover/item:text-neutral-200 group-hover/item:border-white/25 transition-colors">
                              {subItem.badge}
                            </span>
                          )}
                        </div>
                        {subItem.description && (
                          <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 group-hover/item:text-neutral-300 transition-colors leading-relaxed font-normal">
                            {subItem.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              {/* Featured Spotlight Card */}
              {currentSection.featured && (
                <div className="flex flex-col justify-between p-5 rounded-xl bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent border border-white/[0.08] hover:border-white/[0.16] transition-all group/card">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-medium">
                        {currentSection.featured.eyebrow}
                      </span>
                      {currentSection.featured.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {currentSection.featured.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-white group-hover/card:text-white transition-colors">
                      {currentSection.featured.title}
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                      {currentSection.featured.description}
                    </p>
                  </div>
                  <a
                    href={currentSection.featured.href}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-neutral-200 mt-5 pt-3.5 border-t border-white/[0.06] group/feat transition-colors"
                    onClick={() => setActiveMenu(null)}
                  >
                    <span>{currentSection.featured.ctaText || "Explore Details →"}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SiteMobileNav({ currentPath }: NavProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger
        className="mobile-navigation"
        render={<Button size="sm" variant="outline" />}
      >
        <MenuIcon aria-hidden="true" />
        <span>Menu</span>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-[#050505] border-white/10 text-white w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="text-left pb-4 border-b border-white/[0.08]">
          <SheetTitle className="text-white flex items-center gap-2">
            <img
              src="/brand/stack-and-scale-logo-horizontal.png"
              alt="Stack & Scale"
              className="h-6 w-auto object-contain"
            />
          </SheetTitle>
          <SheetDescription className="text-neutral-400 text-xs">
            Sovereign software systems, automation pipelines, and engineering.
          </SheetDescription>
        </SheetHeader>

        {/* Categorized Mobile Navigation */}
        <div className="flex flex-col gap-6 py-4">
          {/* 1. AUTOMATION & AI */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                Automation & AI
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">0{automationNavItems.length}</span>
            </div>
            <div className="flex flex-col gap-1 pl-3 border-l border-white/[0.08]">
              {automationNavItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="py-1.5 text-sm text-neutral-300 hover:text-white flex items-center justify-between"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* 2. WEB DEVELOPMENT */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                Web Development
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">0{webDevNavItems.length}</span>
            </div>
            <div className="flex flex-col gap-1 pl-3 border-l border-white/[0.08]">
              {webDevNavItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="py-1.5 text-sm text-neutral-300 hover:text-white flex items-center justify-between"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* 3. CASE STUDIES */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                Case Studies
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">0{caseStudiesNavItems.length}</span>
            </div>
            <div className="flex flex-col gap-1 pl-3 border-l border-white/[0.08]">
              {caseStudiesNavItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="py-1.5 text-sm text-neutral-300 hover:text-white flex items-center justify-between"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* 4. SOVEREIGN PRODUCTS */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                Sovereign Products
              </p>
              <span className="text-[10px] text-neutral-500 font-mono">0{productsNavItems.length}</span>
            </div>
            <div className="flex flex-col gap-1 pl-3 border-l border-white/[0.08]">
              {productsNavItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="py-1.5 text-sm text-neutral-300 hover:text-white flex items-center justify-between"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Main Links */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2">
            <a
              href="/approach"
              className="text-sm font-medium text-neutral-300 hover:text-white py-1"
              onClick={() => setMobileOpen(false)}
            >
              Approach
            </a>
            <a
              href="/contact"
              className="text-sm font-medium text-neutral-300 hover:text-white py-1"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </a>
            <a
              href="/signin"
              className="text-sm font-medium text-neutral-300 hover:text-white py-1"
              onClick={() => setMobileOpen(false)}
            >
              Client Portal Sign In
            </a>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2.5">
            <a
              href="/#storefront"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-md !bg-white !text-black font-semibold text-sm hover:!bg-neutral-200 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign Up
            </a>
            <a
              href="/#contact"
              className="w-full inline-flex items-center justify-center py-2 px-4 rounded-md bg-black text-white border border-white/20 font-medium text-sm hover:bg-neutral-900 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Get a Demo
            </a>
            <a
              href="/signin"
              className="w-full inline-flex items-center justify-center py-1.5 px-4 text-neutral-400 font-medium text-sm hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Log In
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SiteNavigation({ currentPath }: NavProps) {
  return (
    <>
      <SiteDesktopNav currentPath={currentPath} />
      <SiteMobileNav currentPath={currentPath} />
    </>
  );
}

