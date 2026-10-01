import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_EMAIL, LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/refunds")({
  head: () => ({
    meta: [
      { title: "Refund, Cancellation & Delivery Policy | Rezyn" },
      { name: "description", content: "How Rezyn website credits are delivered, and when purchases can be refunded." },
      { property: "og:title", content: "Refund, Cancellation & Delivery Policy | Rezyn" },
      { property: "og:description", content: "Delivery and refund rules for Rezyn website redesign credits." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      index="06"
      title="Refunds & Delivery"
      summary="Rezyn sells digital credits. Nothing is shipped physically. Here's when you can get your money back."
      sections={[
        {
          heading: "Delivery",
          body: (
            <p>
              Credits are added to your account automatically as soon as the payment provider confirms payment — usually
              within seconds, occasionally up to a few hours for some bank or UPI payments. Nothing is shipped physically.
            </p>
          ),
        },
        {
          heading: "Unused credits",
          body: (
            <p>
              If you haven't used any credits from a pack, you can request a full refund within 7 days of purchase. If you've
              used some, you can request a refund of the unused credits at the per-website price you paid.
            </p>
          ),
        },
        {
          heading: "Used credits",
          body: (
            <p>
              A credit is used when you start a redesign on a project. Because AI processing costs are incurred at that
              point, used credits aren't normally refundable. If the redesign failed on every file because of a fault on our
              side, contact us and we'll restore the credit or refund it.
            </p>
          ),
        },
        {
          heading: "Failed or double payments",
          body: (
            <p>
              If money was debited but no credits appeared, or you were charged twice, email us with the order reference. Any
              amount debited without a successful order is reversed by the payment provider, typically within 5–7 working days.
            </p>
          ),
        },
        {
          heading: "How to request",
          body: (
            <p>
              Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from your account email with the order reference
              (shown on your payment confirmation). Approved refunds go back to the original payment method within 5–7 working
              days. See also our <Link to="/legal/terms">Terms of Service</Link>.
            </p>
          ),
        },
      ]}
    />
  ),
});
