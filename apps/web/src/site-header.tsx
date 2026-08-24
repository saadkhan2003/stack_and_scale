import { primaryNavigation } from "./navigation";

type SiteHeaderProps = {
  currentPath?: string;
};

export function SiteHeader({ currentPath }: SiteHeaderProps) {
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
      <details className="mobile-navigation">
        <summary>Menu</summary>
        <nav aria-label="Compact navigation">
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
      </details>
      <a className="header-cta" href="/#contact">
        Book a demo <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
