import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Section } from "@/components/site/Section";
import { budgetRanges, productTypes } from "@/data/site";
import { auditRequestSchema, submitAuditRequest } from "@/lib/audit.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Request an audit — Rezyn interface revisions" },
      {
        name: "description",
        content:
          "Tell us what you're working with and we'll reply with a short read on where your interface is losing you the most.",
      },
      { property: "og:title", content: "Request an audit — Rezyn" },
      {
        property: "og:description",
        content: "A short read on where your interface is losing you the most, before you commit.",
      },
    ],
  }),
  component: ContactPage,
});

const fieldClass =
  "w-full border border-border bg-paper-dim px-3 py-[11px] text-[15px] text-foreground focus:bg-background focus:outline-2 focus:outline-offset-1 focus:outline-revision";

function ContactPage() {
  const submit = useServerFn(submitAuditRequest);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      productUrl: String(form.get("productUrl") ?? ""),
      productType: String(form.get("productType") ?? ""),
      budgetRange: String(form.get("budgetRange") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    const parsed = auditRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("sending");
    try {
      await submit({ data: parsed.data });
      setStatus("done");
    } catch {
      setStatus("idle");
      setFormError("We couldn't send that. Please try again in a moment.");
    }
  }

  return (
    <main>
      <Section last>
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          <div>
            <h1 className="mb-[18px] text-[34px]">Request an audit</h1>
            <p className="max-w-[380px] text-ink-soft">
              Tell us what you're working with. We'll reply with a short read on where the
              interface is losing you the most — before you commit to anything.
            </p>
            <p className="mark-hand mt-8 -rotate-[1.5deg] text-[24px] text-revision">
              ↳ no rebuild required.
            </p>
          </div>

          {status === "done" ? (
            <div className="border border-border bg-revision-bg p-8">
              <h2 className="text-[24px]">Request received</h2>
              <p className="mt-3 text-[15.5px] text-ink-soft">
                Thanks — we'll read through your product and reply to your email with our first
                markup notes.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <Field label="Name" error={errors["name"]}>
                <input id="name" name="name" type="text" className={fieldClass} />
              </Field>
              <Field label="Email" error={errors["email"]}>
                <input id="email" name="email" type="email" className={fieldClass} />
              </Field>
              <Field label="Company (optional)" error={errors["company"]}>
                <input id="company" name="company" type="text" className={fieldClass} />
              </Field>
              <Field label="Product URL" error={errors["productUrl"]}>
                <input
                  id="productUrl"
                  name="productUrl"
                  type="url"
                  placeholder="https://"
                  className={fieldClass}
                />
              </Field>
              <Field label="What are we revising?" error={errors["productType"]}>
                <select id="productType" name="productType" className={fieldClass} defaultValue={productTypes[0]}>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Budget range (optional)" error={errors["budgetRange"]}>
                <select id="budgetRange" name="budgetRange" className={fieldClass} defaultValue="">
                  <option value="">Prefer not to say</option>
                  {budgetRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="What's going wrong? (optional)" error={errors["message"]}>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className={`${fieldClass} min-h-20 resize-y`}
                />
              </Field>

              {formError ? (
                <p className="mb-4 text-sm text-destructive">{formError}</p>
              ) : null}

              <button
                type="submit"
                disabled={status === "sending"}
                className="border border-primary bg-primary px-[22px] py-[11px] text-[14.5px] font-medium text-primary-foreground transition-colors hover:bg-ink-soft disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send for review"}
              </button>
            </form>
          )}
        </div>
      </Section>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="mb-[6px] block text-sm text-muted-foreground">{label}</label>
      {children}
      {error ? <p className="mt-[6px] text-[13px] text-destructive">{error}</p> : null}
    </div>
  );
}
