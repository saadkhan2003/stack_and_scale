"use client";

import * as React from "react";
import { ChevronDown, MenuIcon } from "lucide-react";
import { StackAndScaleLogo } from "./brand-logo";
import {
  simpleNavItems,
  linearDropdowns,
  type LinearDropdownData,
  automationNavItems,
  webDevNavItems,
  caseStudiesNavItems,
  productsNavItems,
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
    if (linearDropdowns[href]) {
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

  const activeDropdown: LinearDropdownData | undefined = activeMenu
    ? linearDropdowns[activeMenu]
    : undefined;

  return (
    <div
      ref={navContainerRef}
      className="desktop-navigation-wrapper relative hidden md:flex items-center justify-center"
      onMouseLeave={handleMouseLeave}
    >
      {/* Centered Floating Pill Capsule matching Linear */}
      <nav
        aria-label="Main navigation"
        className="desktop-navigation flex items-center gap-0.5 bg-[#09090b]/80 border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-xl rounded-full px-2 py-1 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
      >
        {simpleNavItems.map((item) => {
          const hasDropdown =
            item.hasSubmenu && Boolean(linearDropdowns[item.href]);
          const isOpen = activeMenu === item.href;
          const isCurrent = currentPath === item.href;

          return (
            <div
              key={item.label}
              className="relative flex items-center"
              onMouseEnter={() => handleMouseEnter(item.href)}
            >
              <a
                href={item.href}
                className={cn(
                  "nav-top-link flex items-center gap-1 text-[13px] leading-none select-none tracking-tight transition-all duration-150 px-3 py-1.5 rounded-full font-normal",
                  isOpen
                    ? "text-white bg-white/[0.08] font-medium"
                    : isCurrent
                      ? "text-white font-medium"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]",
                )}
                aria-current={isCurrent ? "page" : undefined}
                aria-expanded={hasDropdown ? isOpen : undefined}
                aria-haspopup={hasDropdown ? "menu" : undefined}
                onClick={() => {
                  if (hasDropdown && isOpen) {
                    setActiveMenu(null);
                  }
                }}
              >
                <span>{item.label}</span>
                {hasDropdown && (
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-neutral-500 transition-transform duration-200 ease-out",
                      isOpen
                        ? "rotate-180 text-white"
                        : "group-hover:text-white",
                    )}
                    aria-hidden="true"
                  />
                )}
              </a>
            </div>
          );
        })}
      </nav>

      {/* Linear-style floating dropdown card (anchored under the nav items) */}
      <div
        className={cn(
          "linear-dropdown-panel absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-[760px] max-w-[94vw] bg-[#0c0c0e]/98 backdrop-blur-2xl border border-white/[0.12] rounded-xl p-5 shadow-[0_24px_64px_rgba(0,0,0,0.95)] z-50 text-left transition-all duration-200",
          activeDropdown && activeMenu
            ? "opacity-100 translate-y-0 pointer-events-auto visible"
            : "opacity-0 -translate-y-2 pointer-events-none invisible",
        )}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="region"
        aria-label="Navigation sub-menu"
      >
        {/* Subtle top hairline highlight */}
        <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {activeDropdown && (
          <>
            {/* 3 Columns Layout */}
            <div className="grid grid-cols-12 gap-5 pb-4 border-b border-white/[0.08]">
              {/* Col 1 */}
              <div className="col-span-5 flex flex-col gap-2.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold px-2">
                  Featured Capabilities
                </span>
                <div className="flex flex-col gap-1">
                  {activeDropdown.col1.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className="group/item flex flex-col p-2.5 rounded-lg hover:bg-white/[0.05] transition-all duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-white/95 group-hover/item:text-white transition-colors">
                          {item.title}
                        </span>
                        <span className="text-xs text-neutral-500 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all">
                          →
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 group-hover/item:text-neutral-300 leading-relaxed mt-0.5 transition-colors font-normal">
                        {item.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>

              {/* Col 2 */}
              <div className="col-span-4 flex flex-col gap-2.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold px-2">
                  Infrastructure
                </span>
                <div className="flex flex-col gap-1">
                  {activeDropdown.col2.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className="group/item flex flex-col p-2.5 rounded-lg hover:bg-white/[0.05] transition-all duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-white/95 group-hover/item:text-white transition-colors">
                          {item.title}
                        </span>
                        <span className="text-xs text-neutral-500 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all">
                          →
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 group-hover/item:text-neutral-300 leading-relaxed mt-0.5 transition-colors font-normal">
                        {item.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links Column */}
              <div className="col-span-3 flex flex-col gap-2.5 pl-3 border-l border-white/[0.08]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                  Explore
                </span>
                <div className="flex flex-col gap-1">
                  {activeDropdown.quickLinks.map((link) => (
                    <a
                      key={link.title}
                      href={link.href}
                      onClick={() => setActiveMenu(null)}
                      className="text-[12px] text-neutral-400 hover:text-white hover:translate-x-0.5 transition-all py-1 font-medium flex items-center justify-between group/link"
                    >
                      <span>{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Announcement Bar */}
            <div className="pt-3 px-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-neutral-300">
                <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/15">
                  {activeDropdown.bottomBar.badge}
                </span>
                <span className="text-[12px] text-neutral-300 font-normal">
                  {activeDropdown.bottomBar.text}
                </span>
              </div>
              <a
                href={activeDropdown.bottomBar.ctaHref}
                onClick={() => setActiveMenu(null)}
                className="text-[12px] text-white hover:text-neutral-200 font-medium inline-flex items-center gap-1 group/bar"
              >
                <span>{activeDropdown.bottomBar.ctaText}</span>
              </a>
            </div>
          </>
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
            <StackAndScaleLogo size={24} textClassName="text-[18px]" />
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
              <span className="text-[10px] text-neutral-500 font-mono">
                0{automationNavItems.length}
              </span>
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
              <span className="text-[10px] text-neutral-500 font-mono">
                0{webDevNavItems.length}
              </span>
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
              <span className="text-[10px] text-neutral-500 font-mono">
                0{caseStudiesNavItems.length}
              </span>
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
              <span className="text-[10px] text-neutral-500 font-mono">
                0{productsNavItems.length}
              </span>
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
              aria-current={currentPath === "/approach" ? "page" : undefined}
              className={cn(
                "text-sm font-medium text-neutral-300 hover:text-white py-1",
                currentPath === "/approach" && "text-white font-semibold",
              )}
              onClick={() => setMobileOpen(false)}
            >
              Approach
            </a>
            <a
              href="/contact"
              aria-current={currentPath === "/contact" ? "page" : undefined}
              className={cn(
                "text-sm font-medium text-neutral-300 hover:text-white py-1",
                currentPath === "/contact" && "text-white font-semibold",
              )}
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </a>
            <a
              href="/signin"
              aria-current={currentPath === "/signin" ? "page" : undefined}
              className={cn(
                "text-sm font-medium text-neutral-300 hover:text-white py-1",
                currentPath === "/signin" && "text-white font-semibold",
              )}
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </a>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2.5">
            <a
              href="/signin"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-md !bg-white !text-black font-semibold text-sm hover:!bg-neutral-200 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </a>
            <a
              href="/#contact"
              className="w-full inline-flex items-center justify-center py-2 px-4 rounded-md bg-black text-white border border-white/20 font-medium text-sm hover:bg-neutral-900 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Get a Demo
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
