import { cookies } from "next/headers";
import { StackAndScaleLogo } from "./brand-logo";
import { getPublicSearchIndex } from "./public-search";
import { SearchDialog } from "./search-dialog";
import { SiteDesktopNav, SiteMobileNav } from "./site-navigation";
import { getPublishedNavigation } from "./cms-content";
import type { CmsNavigationItem } from "./cms-content";
import type { SimpleNavItem } from "./navigation";

import { AnnouncementBar } from "./announcement-bar";
import {
  SiteHeaderAuth,
  MobileHeaderAuthLink,
  type SessionState,
} from "./site-header-auth";

type SiteHeaderProps = {
  currentPath?: string | undefined;
};

export async function SiteHeader({ currentPath }: SiteHeaderProps) {
  let initialSession: SessionState | undefined = undefined;
  try {
    const cookieStore = await cookies();
    const cookieStr = cookieStore.toString();
    if (cookieStr.includes("ss_session=")) {
      initialSession = {
        authenticated: true,
        role: "staff",
        workspaceUrl: "/staff/leads",
      };
    }
  } catch {
    // Falls back gracefully on static routes
  }

  const [searchEntries, cmsNav] = await Promise.all([
    getPublicSearchIndex(),
    getPublishedNavigation(),
  ]);

  const dynamicNavItems: readonly SimpleNavItem[] | undefined =
    cmsNav?.items && cmsNav.items.length > 0
      ? cmsNav.items.map((item: CmsNavigationItem) => {
          let href = "/";
          if (item.linkType === "external" && item.url) {
            href = item.url;
          } else if (typeof item.page === "object" && item.page?.slug) {
            href = `/${item.page.slug}`;
          } else if (typeof item.page === "string") {
            href = `/${item.page}`;
          } else if (item.url) {
            href = item.url;
          }

          const mappedChildren =
            Array.isArray(item.children) && item.children.length > 0
              ? item.children.map((child: CmsNavigationItem) => {
                  let childHref = "/";
                  if (child.linkType === "external" && child.url) {
                    childHref = child.url;
                  } else if (
                    typeof child.page === "object" &&
                    child.page?.slug
                  ) {
                    childHref = `/${child.page.slug}`;
                  } else if (typeof child.page === "string") {
                    childHref = `/${child.page}`;
                  } else if (child.url) {
                    childHref = child.url;
                  }
                  return {
                    label: child.label,
                    href: childHref,
                  };
                })
              : undefined;

          return {
            label: item.label,
            href,
            hasSubmenu: Boolean(mappedChildren && mappedChildren.length > 0),
            ...(item.badge ? { badge: item.badge } : {}),
            ...(mappedChildren ? { children: mappedChildren } : {}),
          };
        })
      : undefined;

  return (
    <>
      <AnnouncementBar announcement={cmsNav?.announcement} />
      <header className="site-header sticky top-0 z-50">
        {/* Left zone: Brand */}
        <div className="flex items-center gap-3">
          <a
            className="brand flex items-center gap-2 text-white/95 hover:text-white transition-opacity"
            href="/"
            aria-label="Stack & Scale home"
          >
            <StackAndScaleLogo
              size={24}
              textClassName="flex text-[17px] sm:text-[18.5px]"
            />
          </a>
        </div>

        {/* Center zone: Linear Floating Capsule Navigation */}
        <div className="hidden md:flex items-center justify-center">
          <SiteDesktopNav
            currentPath={currentPath}
            navItems={dynamicNavItems}
          />
        </div>

        {/* Right zone: Actions matching Linear */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2.5">
            <SearchDialog entries={searchEntries} />
            <SiteHeaderAuth initialSession={initialSession} />
          </div>

          {/* Mobile menu trigger, fast search, and sign-in */}
          <div className="flex items-center gap-1.5 md:hidden">
            <SearchDialog entries={searchEntries} />
            <MobileHeaderAuthLink initialSession={initialSession} />
            <SiteMobileNav
              currentPath={currentPath}
              navItems={dynamicNavItems}
              initialSession={initialSession}
            />
          </div>
        </div>
      </header>
    </>
  );
}
