import { StackAndScaleLogo } from "./brand-logo";
import { getPublicSearchIndex } from "./public-search";
import { SearchDialog } from "./search-dialog";
import { SiteDesktopNav, SiteMobileNav } from "./site-navigation";
import { getPublishedNavigation } from "./cms-content";
import type { SimpleNavItem } from "./navigation";
import { AnnouncementBar } from "./announcement-bar";

type SiteHeaderProps = {
  currentPath?: string | undefined;
};

export async function SiteHeader({ currentPath }: SiteHeaderProps) {
  const [searchEntries, cmsNav] = await Promise.all([
    getPublicSearchIndex(),
    getPublishedNavigation(),
  ]);

  const dynamicNavItems: readonly SimpleNavItem[] | undefined =
    cmsNav?.items && cmsNav.items.length > 0
      ? cmsNav.items.map((item) => {
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
          return {
            label: item.label,
            href,
            hasSubmenu: Boolean(item.children && item.children.length > 0),
            ...(item.badge ? { badge: item.badge } : {}),
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
          <SiteDesktopNav currentPath={currentPath} navItems={dynamicNavItems} />
        </div>

        {/* Right zone: Actions matching Linear */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2.5">
            <SearchDialog entries={searchEntries} />
            <a
              href="/signin"
              className="text-[13.5px] font-medium text-black bg-white hover:bg-neutral-200 px-4 py-1.5 rounded-lg transition-all whitespace-nowrap shadow-sm"
            >
              Sign in
            </a>
          </div>

          {/* Mobile menu trigger, fast search, and sign-in */}
          <div className="flex items-center gap-1.5 md:hidden">
            <SearchDialog entries={searchEntries} />
            <a
              href="/signin"
              className="text-xs font-medium text-neutral-300 hover:text-white px-2 py-1 hidden sm:inline"
            >
              Log in
            </a>
            <SiteMobileNav currentPath={currentPath} navItems={dynamicNavItems} />
          </div>
        </div>
      </header>
    </>
  );
}
