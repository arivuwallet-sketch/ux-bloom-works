import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/styles", label: "Styles" },
  { to: "/trends", label: "Trends" },
  { to: "/work", label: "Work" },
  { to: "/projects", label: "Workspace" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between px-8 py-[18px]">
        <Link to="/" className="flex items-center gap-2 font-serif text-[30px] tracking-[0.14em]">
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
        <Link
          to="/projects"
          className="glow-aurora bg-revision px-[18px] py-[9px] text-[14.5px] font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
        >
          Upload a project
        </Link>
      </div>
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
