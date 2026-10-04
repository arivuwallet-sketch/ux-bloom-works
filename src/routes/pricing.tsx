import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";
import { BuyPackButton } from "@/components/site/BuyPackButton";
import { getPricing } from "@/lib/billing.functions";
import { formatPrice, type CurrencyCode } from "@/lib/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — website redesign packs | Rezyn" },
      {
        name: "description",
        content:
          "Pay per website. Packs of 1, 5, 10 or 20 website redesigns, priced in your local currency. No subscription.",
      },
      { property: "og:title", content: "Rezyn pricing — pay per website" },
      {
        property: "og:description",
        content:
          "Packs of 1, 5, 10 or 20 website redesigns. No subscription, credits never expire.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => getPricing(),
  errorComponent: () => (
    <main className="wrap py-40">
      <p>Pricing could not load. Please refresh the page.</p>
    </main>
  ),
  notFoundComponent: () => <main className="wrap py-40">Not found.</main>,
  component: PricingPage,
});

const included = [
  "Every supported file in the project redesigned",
  "Any of the 61 style directions, per project or per file",
  "Re-run and refine the same project at no extra cost",
  "Project chat for follow-up changes",
  "ZIP download of the redesigned files",
];

function PricingPage() {
  const pricing = Route.useLoaderData();
  const currency = pricing.currency as CurrencyCode;

  return (
    <main>
      <PageHero
        index="07"
        eyebrow="Pricing"
        title="Pay per"
        accent="website."
        description="No subscription. Buy a pack, and each website project you redesign uses one credit. Re-running or refining that same project is free."
        stat={formatPrice(pricing.packs[0]?.amount ?? 0, currency)}
        statLabel="per website, single pack"
      />

      <Section>
        <SectionHeading
          label={`Prices in ${currency}`}
          title="Choose a pack."
          description={
            currency === "INR"
              ? "Prices shown in Indian Rupees, including all fees."
              : `Shown in ${currency} based on your location. Your bank may add its own foreign-transaction fee.`
          }
        />
        <div className="pricing-grid">
          {pricing.packs.map((pack, i) => {
            const featured = i === 1;
            const single = pricing.packs[0]?.amount ?? pack.amount;
            const compareAt = Math.round(single * pack.websites * 100) / 100;
            const saving = Math.round((compareAt - pack.amount) * 100) / 100;
            const savingPct = compareAt > 0 ? Math.round((saving / compareAt) * 100) : 0;
            const perSite = Math.round((pack.amount / pack.websites) * 100) / 100;
            return (
              <article
                key={pack.id}
                className={`glass pricing-card${featured ? " is-featured" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="pricing-card__tier">{pack.label}</span>
                  {featured ? <span className="pricing-card__badge">Most popular</span> : null}
                </div>
                <p className="pricing-card__for">{pack.bestFor}</p>
                <div className="pricing-card__count">
                  {pack.websites}
                  <span>{pack.websites === 1 ? "website" : "websites"}</span>
                </div>
                <div className="pricing-card__pricing">
                  <div className="flex items-baseline gap-3">
                    <span className="pricing-card__price">
                      {formatPrice(pack.amount, currency)}
                    </span>
                    {saving > 0 ? (
                      <s className="pricing-card__compare">{formatPrice(compareAt, currency)}</s>
                    ) : null}
                  </div>
                  {saving > 0 ? (
                    <span className="pricing-card__save">
                      You save {formatPrice(saving, currency)} · {savingPct}% off
                    </span>
                  ) : (
                    <span className="pricing-card__save is-muted">Standard rate</span>
                  )}
                </div>
                <p className="pricing-card__per">
                  {formatPrice(perSite, currency)} per website · {pack.note}
                </p>
                <BuyPackButton packId={pack.id} label={`Get ${pack.label}`} featured={featured} />
              </article>
            );
          })}
        </div>
        <p className="mt-6 max-w-[70ch] text-[13px] leading-6 text-muted-foreground">
          Savings are compared with buying the same number of Starter packs one at a time. The
          discount steps up with each pack — about 20% off on Studio, 30% on Agency and 40% on Scale
          — so every website costs less the more you buy.
        </p>
      </Section>

      <Section last tone="quiet">
        <SectionHeading label="Every credit includes" title="What one website gets you." />
        <ul className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {included.map((item) => (
            <li key={item} className="glass flex items-start gap-4 p-5">
              <Check className="mt-1 h-5 w-5 shrink-0 text-revision" />
              <span className="text-[15px] leading-7 text-ink-soft">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-[70ch] text-[14px] leading-7 text-muted-foreground">
          A credit is used the first time you start a redesign on a project. Credits don't expire.
          Output is AI-generated and should be reviewed before shipping — see the{" "}
          <Link to="/legal/ai-disclosure" className="underline">
            AI Disclosure
          </Link>{" "}
          and{" "}
          <Link to="/legal/refunds" className="underline">
            Refund Policy
          </Link>
          .
        </p>
      </Section>
    </main>
  );
}
