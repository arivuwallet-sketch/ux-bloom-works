import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/acceptable-use")({
  head: () => ({
    meta: [
      { title: "Acceptable Use Policy | Rezyn" },
      {
        name: "description",
        content: "What you may and may not upload to or redesign with Rezyn.",
      },
      { property: "og:title", content: "Acceptable Use Policy | Rezyn" },
      {
        property: "og:description",
        content: "Rules for using the Rezyn redesign workspace responsibly.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      index="04"
      title="Acceptable Use Policy"
      summary="Short version: redesign things you own or have permission to change, and don't use Rezyn to deceive or harm people."
      sections={[
        {
          heading: "Only upload what you're allowed to",
          body: (
            <p>
              Upload only projects you own or are authorised to modify. Don't upload someone else's
              code or design to copy it.
            </p>
          ),
        },
        {
          heading: "No deceptive interfaces",
          body: (
            <p>
              Don't use Rezyn to build phishing pages, impersonate other brands, or create dark
              patterns designed to trick people into payments, sign-ups or data sharing.
            </p>
          ),
        },
        {
          heading: "No harmful content",
          body: (
            <p>
              Don't upload malware, illegal content, or material that harasses, exploits or
              discriminates against people.
            </p>
          ),
        },
        {
          heading: "Don't abuse the service",
          body: (
            <p>
              Don't attempt to bypass limits, access other users' data, overload the system, or
              resell access without permission.
            </p>
          ),
        },
        {
          heading: "Enforcement",
          body: (
            <p>
              We may remove content or suspend accounts that break this policy. Where reasonable,
              we'll explain why first.
            </p>
          ),
        },
      ]}
    />
  ),
});
