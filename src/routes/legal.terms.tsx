import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_EMAIL, LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Rezyn" },
      { name: "description", content: "The terms for using Rezyn to upload, redesign and download project files." },
      { property: "og:title", content: "Terms of Service | Rezyn" },
      { property: "og:description", content: "Plain-language terms for using the Rezyn redesign workspace." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      index="01"
      title="Terms of Service"
      summary="By creating an account or using Rezyn you agree to these terms. We've written them to be read, not skimmed past."
      sections={[
        {
          heading: "What Rezyn is",
          body: (
            <p>
              Rezyn is a software tool. You upload project files, choose a visual direction, and Rezyn uses AI models to
              produce redesigned versions of supported text and code files, which you can download as a ZIP. Rezyn is not a
              design agency, does not assign humans to your project, and does not deploy anything to your live product.
            </p>
          ),
        },
        {
          heading: "Your account",
          body: (
            <p>
              You need an account to use the workspace. Keep your sign-in secure — you're responsible for activity under
              your account. You must be at least 16 years old, or the age of digital consent where you live.
            </p>
          ),
        },
        {
          heading: "Your files stay yours",
          body: (
            <>
              <p>
                You keep all rights in the files you upload. You give us a limited licence to store, process and transmit
                them only as needed to run the service for you — including sending file contents to our AI provider to
                generate redesigns. We don't use your files to train AI models, sell them, or show them to other users.
              </p>
              <p>
                You confirm you have the right to upload and modify everything you submit. Redesigned output is provided to
                you; as between you and Rezyn, you may use it however you like.
              </p>
            </>
          ),
        },
        {
          heading: "No guarantees about AI output",
          body: (
            <>
              <p>
                AI output can contain errors. Rezyn runs automated checks, but it <strong>does not guarantee</strong> that
                redesigned files will compile, behave identically to the originals, be free of bugs, meet accessibility
                standards, or be fit for any particular purpose. You must review and test output before using it in
                production. See the <Link to="/legal/ai-disclosure">AI Disclosure</Link>.
              </p>
              <p>The service is provided "as is" and "as available", to the extent permitted by law.</p>
            </>
          ),
        },
        {
          heading: "Fair use and limits",
          body: (
            <p>
              Files have size limits and only certain text and code formats are redesigned. We may rate-limit or pause
              processing to keep the service stable. You agree to follow the <Link to="/legal/acceptable-use">Acceptable Use Policy</Link>.
            </p>
          ),
        },
        {
          heading: "Pricing",
          body: (
            <p>
              Rezyn sells one-off packs of website credits shown on the <Link to="/pricing">Pricing page</Link>. One credit
              is used the first time you start a redesign on a project; re-running or refining that same project is free.
              Credits don't expire. Prices are shown in your local currency before you pay, and payments are processed by
              Cashfree Payments. There is no subscription and no automatic renewal. Refunds follow our{" "}
              <Link to="/legal/refunds">Refund Policy</Link>.
            </p>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              To the extent permitted by law, Rezyn isn't liable for indirect or consequential losses, lost profits, or data
              loss arising from your use of output. Keep your own backups of your original project — Rezyn is not a backup
              service. Nothing in these terms limits liability that can't be limited by law.
            </p>
          ),
        },
        {
          heading: "Ending things",
          body: (
            <p>
              You can stop using Rezyn and delete your files at any time, and request full account deletion by emailing{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may suspend accounts that break these terms.
            </p>
          ),
        },
        {
          heading: "Changes",
          body: (
            <p>
              If we change these terms in a meaningful way, we'll update the date at the top and, where appropriate, notify
              you before the change takes effect.
            </p>
          ),
        },
      ]}
    />
  ),
});
