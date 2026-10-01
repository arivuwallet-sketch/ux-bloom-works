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
  action?: { to: "/projects" | "/process" | "/styles" | "/trends" | "/work" | "/why-rezyn"; label: string };
  aside?: ReactNode;
}) {
  return (
    <section className="archive-hero">
      <div className="wrap archive-hero__wrap">
        <div className="archive-hero__index" aria-hidden>
          <span>{index}</span>
          <ArrowDownRight className="h-5 w-5" />
        </div>

        <div className="archive-hero__main">
          <Reveal>
            <div className="archive-hero__meta">
              <span>{eyebrow}</span>
              <span>REZYN / VISUAL SYSTEM</span>
            </div>
            <h1>
              <span>{title}</span>
              {accent ? <em>{accent}</em> : null}
            </h1>
            <div className="archive-hero__caption">
              <p>{description}</p>
              {action ? (
                <Link to={action.to} className="archive-hero__action">
                  <span>{action.label}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal className="archive-hero__aside" delay={0.12}>
          <div className="archive-hero__aside-head">
            <span>ISSUE / {index}</span>
            <span>LIVE</span>
          </div>
          {aside ?? (
            <div className="archive-hero__stat">
              <strong>{stat ?? "∞"}</strong>
              <span>{statLabel ?? "directions available"}</span>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
