import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/services", label: "Capabilities" },
  { to: "/process", label: "Process" },
  { to: "/styles", label: "Directions" },
  { to: "/trends", label: "Signals" },
  { to: "/work", label: "Proof" },
  { to: "/why-rezyn", label: "Why Rezyn" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`archive-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="archive-header__utility">
        <span>REZYN / INTERFACE TRANSFORMATION ARCHIVE</span>
        <span className="archive-header__utility-center">EST. DIGITAL / REVISION SYSTEM</span>
        <span>INDEX 00—06</span>
      </div>

      <div className="archive-header__main">
        <Link to="/" onClick={() => setOpen(false)} className="archive-brand" aria-label="Rezyn home">
          <span className="archive-brand__mark">RZ</span>
          <span className="archive-brand__word">REZYN</span>
        </Link>

        <nav className="archive-nav" aria-label="Primary navigation">
          {navItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className="archive-nav__item"
              activeProps={{ className: "is-active" }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
            </Link>
          ))}
        </nav>

        <div className="archive-header__actions">
          <Link to="/projects" className="archive-workspace">
            Workspace <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="archive-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`archive-mobile${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="archive-mobile__top">
          <span>REZYN / DIRECTORY</span>
          <span>07 ENTRIES</span>
        </div>
        <div className="archive-mobile__links">
          {navItems.map((item, index) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          ))}
          <Link to="/projects" onClick={() => setOpen(false)} className="archive-mobile__workspace">
            <span>07</span>
            <strong>Workspace</strong>
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="archive-footer">
      <div className="archive-footer__marquee" aria-hidden>
        REVISE / REFRAME / RESTRUCTURE / REZYN / REVISE / REFRAME / RESTRUCTURE / REZYN
      </div>
      <div className="wrap">
        <div className="archive-footer__grid">
          <div className="archive-footer__brand">
            <span>RZ / 26</span>
            <Link to="/">REZYN</Link>
            <p>Existing product. New visual language. AI-generated output — always review and test before shipping.</p>
          </div>

          <div className="archive-footer__directory">
            <span className="archive-footer__label">Directory</span>
            {navItems.map((item, index) => (
              <Link key={item.to} to={item.to}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="archive-footer__directory">
            <span className="archive-footer__label">System</span>
            <Link to="/projects"><span>07</span>Workspace</Link>
            <Link to="/auth"><span>08</span>Account</Link>
            <a href="mailto:hello@rezyn.co"><span>09</span>Contact</a>
          </div>

          <div className="archive-footer__directory">
            <span className="archive-footer__label">Legal</span>
            <Link to="/legal/terms"><span>L1</span>Terms</Link>
            <Link to="/legal/privacy"><span>L2</span>Privacy</Link>
            <Link to="/legal/ai-disclosure"><span>L3</span>AI Disclosure</Link>
            <Link to="/legal/acceptable-use"><span>L4</span>Acceptable Use</Link>
            <Link to="/legal/cookies"><span>L5</span>Cookies</Link>
          </div>
        </div>

        <div className="archive-footer__bottom">
          <span>REZYN INTERFACE TRANSFORMATION SYSTEM</span>
          <span>DESIGN ARCHIVE / 2026</span>
        </div>
      </div>
    </footer>
  );
}
