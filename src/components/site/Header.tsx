import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/services", label: "Capabilities" },
  { to: "/process", label: "Process" },
  { to: "/styles", label: "Directions" },
  { to: "/trends", label: "Signals" },
  { to: "/work", label: "Proof" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
    <header className={`hud-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="hud-header__inner">
        <Link to="/" onClick={() => setOpen(false)} className="brand-lockup" aria-label="Rezyn home">
          <span className="brand-mark" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="brand-word">REZYN</span>
          <span className="brand-version">/ R3</span>
        </Link>

        <nav className="hud-nav" aria-label="Primary navigation">
          {navItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className="hud-nav__item"
              activeProps={{ className: "is-active" }}
            >
              <span className="hud-nav__index">0{index + 1}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hud-actions">
          <Link to="/projects" className="hud-workspace">
            <span>Launch workspace</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="hud-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`mobile-orbit${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-orbit__noise" />
        <div className="mobile-orbit__ring" />
        <div className="mobile-orbit__content">
          <span className="eyebrow">Navigate / Rezyn system</span>
          <div className="mobile-orbit__links">
            {navItems.map((item, index) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                <span>0{index + 1}</span>
                <strong>{item.label}</strong>
                <ArrowUpRight />
              </Link>
            ))}
          </div>
          <Link to="/projects" onClick={() => setOpen(false)} className="button-primary">
            Enter workspace
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__glow" />
      <div className="wrap relative z-10">
        <div className="site-footer__grid">
          <div>
            <Link to="/" className="brand-lockup brand-lockup--footer">
              <span className="brand-mark" aria-hidden>
                <span />
                <span />
                <span />
              </span>
              <span className="brand-word">REZYN</span>
            </Link>
            <p className="site-footer__manifesto">
              Existing product. New gravity. We transform interfaces without throwing away the system underneath.
            </p>
          </div>

          <div className="site-footer__links">
            <span className="eyebrow">Explore</span>
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="site-footer__links">
            <span className="eyebrow">Build</span>
            <Link to="/projects">Workspace</Link>
            <Link to="/auth">Account</Link>
            <a href="mailto:hello@rezyn.co">hello@rezyn.co</a>
          </div>
        </div>

        <div className="site-footer__rail">
          <span>REZYN / INTERFACE TRANSFORMATION SYSTEM</span>
          <span>DESIGNED FOR PRODUCTS THAT ALREADY EXIST</span>
        </div>
      </div>
    </footer>
  );
}
