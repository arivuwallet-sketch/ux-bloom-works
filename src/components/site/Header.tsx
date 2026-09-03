import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/styles", label: "Styles" },
  { to: "/trends", label: "Trends" },
  { to: "/work", label: "Work" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-[6px]">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-[22px]">
        <Link to="/" className="font-serif text-2xl italic tracking-[0.01em]">
          Rezyn
        </Link>
        <nav className="hidden gap-9 text-[15px] text-ink-soft md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/projects"
          className="border border-primary bg-primary px-[18px] py-[9px] text-[14.5px] font-medium text-primary-foreground transition-colors hover:bg-ink-soft"
        >
          Upload a project
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="wrap flex flex-col items-start gap-[10px] text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="font-serif text-[18px] italic">
          Rezyn
        </Link>
        <div>Interface revisions, not rebuilds.</div>
        <a href="mailto:hello@rezyn.co" className="hover:text-foreground">
          hello@rezyn.co
        </a>
      </div>
    </footer>
  );
}
