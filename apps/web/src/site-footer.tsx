export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Stack &amp; Scale</strong>
        <p>Technology for clearer, more dependable operations.</p>
        <div className="footer-status-pill">
          <span className="pulse-dot" aria-hidden="true" />
          <span>ALL SYSTEMS OPERATIONAL · 99.99%</span>
        </div>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/products">Products</a>
        <a href="/services">Services</a>
        <a href="/industries">Industries</a>
        <a href="/resources">Resources</a>
        <a href="/about">About</a>
        <a href="/privacy">Privacy</a>
        <a href="/cookies">Cookies</a>
        <a href="/terms">Terms</a>
      </nav>
      <div>
        <a
          className="button-secondary text-sm inline-flex items-center gap-2"
          href="/contact"
        >
          Contact us <span aria-hidden="true">→</span>
        </a>
      </div>
    </footer>
  );
}
