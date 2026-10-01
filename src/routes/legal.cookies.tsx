import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies & Browser Storage | Rezyn" },
      { name: "description", content: "The small amount of browser storage Rezyn uses, and why. No advertising trackers." },
      { property: "og:title", content: "Cookies & Browser Storage | Rezyn" },
      { property: "og:description", content: "Rezyn uses essential storage only — no ad trackers." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      index="05"
      title="Cookies & Browser Storage"
      summary="Rezyn uses only essential browser storage. There are no advertising or cross-site tracking cookies."
      sections={[
        {
          heading: "Sign-in session",
          body: <p>When you sign in, your browser stores a session token so you stay logged in. Signing out removes it.</p>,
        },
        {
          heading: "Studio preferences",
          body: (
            <p>
              The Studio panel saves your chosen palette, typeface and effect settings in your browser so they're there next
              visit. This never leaves your device.
            </p>
          ),
        },
        {
          heading: "No ad tracking",
          body: <p>We don't use advertising cookies, retargeting pixels, or sell browsing data.</p>,
        },
        {
          heading: "Clearing it",
          body: <p>You can clear site data in your browser settings at any time. You'll be signed out and Studio settings will reset.</p>,
        },
      ]}
    />
  ),
});
