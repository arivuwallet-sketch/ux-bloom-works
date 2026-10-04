import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Rezyn" },
      {
        name: "description",
        content: "What data Rezyn stores, why, who processes it, and how to delete it.",
      },
      { property: "og:title", content: "Privacy Policy | Rezyn" },
      {
        property: "og:description",
        content: "Plain-language privacy policy for the Rezyn redesign workspace.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      index="02"
      title="Privacy Policy"
      summary="We collect only what's needed to run your workspace. No ads, no selling data, no training AI on your files."
      sections={[
        {
          heading: "What we store",
          body: (
            <ul>
              <li>
                <strong>Account:</strong> your email address and, if you sign in with Google, your
                basic profile name.
              </li>
              <li>
                <strong>Projects:</strong> project names, notes, chosen styles and processing
                status.
              </li>
              <li>
                <strong>Files:</strong> the files you upload or create, and the redesigned versions
                Rezyn produces.
              </li>
              <li>
                <strong>Chat:</strong> messages you send in a project's redesign chat and the
                replies.
              </li>
              <li>
                <strong>Technical logs:</strong> basic error and request logs used to keep the
                service working.
              </li>
            </ul>
          ),
        },
        {
          heading: "Who can see it",
          body: (
            <p>
              Your projects and files are private to your account. Access is enforced on the server
              for every request, and files sit in private storage that isn't publicly reachable.
              Other users cannot see your work.
            </p>
          ),
        },
        {
          heading: "Processors we rely on",
          body: (
            <>
              <p>To run Rezyn we use a small number of service providers:</p>
              <ul>
                <li>Cloud hosting, database and file storage.</li>
                <li>
                  Third-party AI model providers, which receive the contents of files being
                  redesigned and your chat messages, only to generate a response.
                </li>
                <li>Google, only if you choose to sign in with Google.</li>
              </ul>
              <p>We don't sell personal data and we don't use your files to train AI models.</p>
            </>
          ),
        },
        {
          heading: "How long we keep it",
          body: (
            <p>
              Files and projects are kept until you delete them. Deleting a file in the workspace
              removes it from storage. Account deletion removes your account and all associated
              projects; email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to request it.
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              Depending on where you live, you may have rights to access, correct, export, or delete
              your data, or to object to certain processing. Email us and we'll respond within 30
              days.
            </p>
          ),
        },
        {
          heading: "Don't upload secrets",
          body: (
            <p>
              Please remove API keys, passwords, environment files and personal customer data before
              uploading. Rezyn only needs your interface files to redesign them.
            </p>
          ),
        },
      ]}
    />
  ),
});
