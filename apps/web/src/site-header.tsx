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
            src="/brand/stack-and-scale-mark.png"
            alt="Stack & Scale"
            width={24}
            height={24}
            className="h-5 w-5 sm:h-6 sm:w-6 object-contain hover:opacity-85 transition-opacity"
          />
        </a>
        <SiteDesktopNav currentPath={currentPath} />
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Desktop actions matching Vercel screenshot */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
          <SearchDialog entries={searchEntries} />
          <a
            href="/#contact"
            className="text-[13px] font-medium text-white/90 hover:text-white bg-black hover:bg-neutral-900 border border-white/[0.18] hover:border-white/[0.32] px-3.5 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap"
          >
            Get a Demo
          </a>
          <a
            href="/signin"
            className="text-[13px] font-medium text-[#888888] hover:text-white px-2.5 py-1.5 transition-colors duration-150 whitespace-nowrap"
          >
            Log In
          </a>
          <a
            href="/#storefront"
            className="text-[13px] font-semibold !text-black !bg-white hover:!bg-[#e6e6e6] px-3.5 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap shadow-sm"
          >
            Sign Up
          </a>
        </div>

        {/* Mobile menu trigger, fast search, and sign-in */}
        <div className="flex items-center gap-1.5 md:hidden">
          <SearchDialog entries={searchEntries} />
          <a
            href="/signin"
            className="text-xs font-medium text-neutral-400 hover:text-white px-2 py-1"
          >
            Log In
          </a>
          <SiteMobileNav currentPath={currentPath} />
        </div>
      </div>
    </header>
  );
}

