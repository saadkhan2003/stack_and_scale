import { primaryNavigation } from "./navigation";
import { getPublicSearchIndex } from "./public-search";
import { SearchDialog } from "./search-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

type SiteHeaderProps = {
  currentPath?: string;
};

export async function SiteHeader({ currentPath }: SiteHeaderProps) {
  const searchEntries = await getPublicSearchIndex();
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Stack & Scale home">
        <img
          src="/brand/stack-and-scale-logo.jpeg"
          alt="Stack & Scale Technologies"
        />
      </a>
      <nav aria-label="Main navigation">
        {primaryNavigation.map((item) => (
          <a
            href={item.href}
            key={item.href}
            aria-current={currentPath === item.href ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger
          className="mobile-navigation"
          render={<Button size="icon" variant="outline" />}
        >
          <MenuIcon />
          <span className="sr-only">Open navigation</span>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Explore Stack &amp; Scale.</SheetDescription>
          </SheetHeader>
          <nav aria-label="Compact navigation" className="mobile-navigation-links">
          {primaryNavigation.map((item) => (
            <a
              href={item.href}
              key={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
          </nav>
        </SheetContent>
      </Sheet>
      <SearchDialog entries={searchEntries} />
      <a className="header-cta" href="/#contact">
        Book a demo <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
