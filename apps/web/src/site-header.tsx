import { getPublicSearchIndex } from "./public-search";
import { SearchDialog } from "./search-dialog";
import { SiteDesktopNav, SiteMobileNav } from "./site-navigation";

type SiteHeaderProps = {
  currentPath?: string | undefined;
};

export async function SiteHeader({ currentPath }: SiteHeaderProps) {
  const searchEntries = await getPublicSearchIndex();
  return (
    <header className="site-header">
      <div className="flex items-center gap-6 lg:gap-8">
        <a className="brand flex items-center" href="/" aria-label="Stack & Scale home">
          <img
            src="/brand/stack-and-scale-logo-horizontal.png"
            alt="Stack & Scale Technologies"
            width={188}
            height={40}
            className="h-9 w-auto object-contain hover:opacity-95 transition-opacity"
          />
        </a>
        <SiteDesktopNav currentPath={currentPath} />
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <SearchDialog entries={searchEntries} />
        <SiteMobileNav currentPath={currentPath} />
        <a className="header-cta" href="/#contact">
          Book a demo <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}

