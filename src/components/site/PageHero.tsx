import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/studio/motion";

export function PageHero({
  index,
  eyebrow,
  title,
  accent,
  description,
  stat,
  statLabel,
  action,
  aside,
}: {
  index: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  stat?: string;
  statLabel?: string;
  action?: { to: "/projects" | "/process" | "/styles" | "/trends" | "/work"; label: string };
  aside?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="page-hero__scan" aria-hidden />
      <div className="wrap page-hero__inner">
        <div className="page-hero__rail" aria-hidden>
          <span>{index}</span>
          <span className="page-hero__rail-line" />
          <ArrowDownRight className="h-4 w-4" />
        </div>

        <div className="page-hero__copy">
          <Reveal>
            <div className="page-hero__meta">
              <span className="eyebrow">{eyebrow}</span>
              <span>REZYN / EXPERIENCE SYSTEM</span>
            </div>
            <h1>
              <span>{title}</span>
              {accent ? <em>{accent}</em> : null}
            </h1>
            <div className="page-hero__lower">
              <p>{description}</p>
              {action ? (
                <Link to={action.to} className="button-secondary">
                  {action.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal className="page-hero__module" delay={0.12}>
          <div className="page-hero__module-grid" aria-hidden />
          <div className="page-hero__module-top">
            <span>LIVE MODULE</span>
            <span className="signal-dot" />
          </div>
          {aside ?? (
            <>
              <strong>{stat ?? "∞"}</strong>
              <span>{statLabel ?? "directions available"}</span>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
