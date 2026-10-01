import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { LEGAL_UPDATED, legalLinks } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/")({
  head: () => ({
    meta: [
      { title: "Legal & trust centre | Rezyn" },
      { name: "description", content: "Rezyn's terms, privacy policy, AI disclosure, acceptable use rules and cookie notice in plain language." },
      { property: "og:title", content: "Legal & trust centre | Rezyn" },
      { property: "og:description", content: "Plain-language terms, privacy, AI disclosure and acceptable use for Rezyn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LegalIndex,
});

const blurbs: Record<string, string> = {
  "/legal/terms": "The agreement for using Rezyn, your responsibilities and ours.",
  "/legal/privacy": "What we store, why, who processes it and how to delete it.",
  "/legal/ai-disclosure": "Exactly how AI is used on your files and what it can get wrong.",
  "/legal/acceptable-use": "What you may and may not upload or redesign.",
  "/legal/cookies": "The small amount of browser storage the site uses.",
};

function LegalIndex() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <div className="legal-page__body legal-page__body--wide">
          <span className="legal-page__label">Legal / 00 · Last updated {LEGAL_UPDATED}</span>
          <h1>Trust, in writing.</h1>
          <p className="legal-page__summary">
            No fine-print tricks. These documents describe how Rezyn actually works today — including its limits. If something
            here doesn't match what you see in the product, tell us and we'll fix whichever one is wrong.
          </p>
          <div className="legal-index">
            {legalLinks.map((link, i) => (
              <Link key={link.to} to={link.to} className="glass legal-index__card">
                <span className="legal-page__label">{String(i + 1).padStart(2, "0")}</span>
                <strong>{link.label}</strong>
                <p>{blurbs[link.to]}</p>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
