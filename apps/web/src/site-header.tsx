import { StackAndScaleLogo } from "./brand-logo";
import { getPublicSearchIndex } from "./public-search";
import { SearchDialog } from "./search-dialog";
import { SiteDesktopNav, SiteMobileNav } from "./site-navigation";

type SiteHeaderProps = {
  currentPath?: string | undefined;
};

export async function SiteHeader({ currentPath }: SiteHeaderProps) {
  const searchEntries = await getPublicSearchIndex();
  return (
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
        <SiteDesktopNav currentPath={currentPath} />
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
          <SiteMobileNav currentPath={currentPath} />
        </div>
      </div>
    </header>
  );
}
