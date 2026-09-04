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
      {/* Left zone: Brand */}
      <div className="flex items-center gap-3">
        <a className="brand flex items-center gap-2 text-white/95 hover:text-white transition-opacity" href="/" aria-label="Stack & Scale home">
          <img
            src="/brand/stack-and-scale-mark.png"
            alt="Stack & Scale"
            width={22}
            height={22}
            className="h-5 w-5 object-contain"
          />
          <span className="font-semibold text-[14px] tracking-tight text-white hidden sm:inline-block">
            Stack &amp; Scale
          </span>
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
            className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors px-2 py-1 whitespace-nowrap"
          >
            Log in
          </a>
          <a
            href="/cloud"
            className="text-[13px] font-medium text-black bg-white hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap shadow-sm"
          >
            Sign up
          </a>
        </div>

        {/* Mobile menu trigger, fast search, and sign-in */}
        <div className="flex items-center gap-1.5 md:hidden">
          <SearchDialog entries={searchEntries} />
          <a
            href="/signin"
            className="text-xs font-medium text-neutral-400 hover:text-white px-2 py-1"
          >
            Log in
          </a>
          <SiteMobileNav currentPath={currentPath} />
        </div>
      </div>
    </header>
  );
}

