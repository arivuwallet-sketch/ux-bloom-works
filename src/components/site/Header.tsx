import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/styles", label: "Styles" },
  { to: "/trends", label: "Trends" },
  { to: "/work", label: "Work" },
  { to: "/projects", label: "Workspace" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between px-6 py-[18px] sm:px-8">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-serif text-[26px] tracking-[0.14em] sm:text-[30px]"
        >
          <span className="h-2 w-2 rounded-full bg-amber shadow-[0_0_12px_var(--amber)]" />
          Rezyn
        </Link>

        <nav className="hidden gap-8 text-[14.5px] text-ink-soft md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative transition-colors hover:text-foreground"
              activeProps={{ className: "text-amber" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="glow-aurora hidden bg-revision px-[18px] py-[9px] text-[14.5px] font-medium text-primary-foreground transition-transform hover:scale-[1.03] sm:inline-block"
          >
            Upload a project
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="glass flex h-11 w-11 items-center justify-center text-foreground md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="glass border-t border-border/50 md:hidden"
          style={{ animation: "rise-in .3s cubic-bezier(.22,1,.36,1) both" }}
        >
          <div className="menu-panel">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "is-active" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="px-[10px] pb-[10px]">
            <Link
              to="/projects"
              onClick={() => setOpen(false)}
              className="block bg-revision px-4 py-[12px] text-center text-[15px] font-medium text-primary-foreground"
            >
              Upload a project
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 py-10 backdrop-blur-xl">
      <div className="wrap flex flex-col items-start gap-[10px] text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="font-serif text-[22px] tracking-[0.14em]">
          Rezyn
        </Link>
        <div>We don’t rebuild. We revise.</div>
        <a href="mailto:hello@rezyn.co" className="transition-colors hover:text-amber">
          hello@rezyn.co
        </a>
      </div>
    </footer>
  );
}
