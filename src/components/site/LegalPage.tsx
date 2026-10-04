import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const LEGAL_UPDATED = "October 1, 2026";
export const CONTACT_EMAIL = "hello@rezyn.co";

export const legalLinks = [
  { to: "/legal/terms", label: "Terms of Service" },
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/ai-disclosure", label: "AI Disclosure" },
  { to: "/legal/acceptable-use", label: "Acceptable Use" },
  { to: "/legal/cookies", label: "Cookies & Storage" },
  { to: "/legal/refunds", label: "Refunds & Delivery" },
] as const;

export type LegalSection = { heading: string; body: ReactNode };

export function LegalPage({
  index,
  title,
  summary,
  sections,
}: {
  index: string;
  title: string;
  summary: string;
  sections: LegalSection[];
}) {
  return (
    <main className="legal-page">
      <div className="wrap">
        <div className="legal-page__grid">
          <aside className="legal-page__aside" aria-label="Legal documents">
            <span className="legal-page__label">Legal / {index}</span>
            <nav>
              <Link
                to="/legal"
                activeOptions={{ exact: true }}
                activeProps={{ className: "is-active" }}
              >
                Overview
              </Link>
              {legalLinks.map((link) => (
                <Link key={link.to} to={link.to} activeProps={{ className: "is-active" }}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          <article className="legal-page__body">
            <span className="legal-page__label">Last updated {LEGAL_UPDATED}</span>
            <h1>{title}</h1>
            <p className="legal-page__summary">{summary}</p>
            <ol className="legal-page__sections">
              {sections.map((section, i) => (
                <li key={section.heading}>
                  <h2>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {section.heading}
                  </h2>
                  <div className="legal-page__text">{section.body}</div>
                </li>
              ))}
            </ol>
            <p className="legal-page__contact">
              Questions about this document? Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
