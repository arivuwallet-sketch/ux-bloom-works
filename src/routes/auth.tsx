import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Rezyn project workspace" },
      {
        name: "description",
        content:
          "Sign in to upload your project files, pick a design style, and download the redesigned project.",
      },
      { property: "og:title", content: "Sign in — Rezyn" },
      {
        property: "og:description",
        content: "Access your Rezyn workspace to upload files and choose design styles.",
      },
    ],
  }),
  component: AuthPage,
});

const fieldClass =
  "w-full border border-border bg-foreground/[0.04] px-3 py-[11px] backdrop-blur-sm text-[15px] text-foreground focus:bg-background focus:outline-2 focus:outline-offset-1 focus:outline-revision";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/projects" });
  }, [loading, user, navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/projects` },
        });
        if (err) throw err;
        setNotice("Check your inbox to confirm your address, then sign in.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/projects` },
    });
    if (err) setError(err.message);
  }

  return (
    <main>
      <Section last>
        <div className="mx-auto max-w-[420px]">
          <h1 className="mb-[10px] text-[32px]">
            {mode === "signin" ? "Sign in" : "Create an account"}
          </h1>
          <p className="mb-8 text-[15.5px] text-ink-soft">
            Your workspace holds your uploaded project files, the styles you pick, and any new
            files you write here.
          </p>

          <button
            type="button"
            onClick={onGoogle}
            className="mb-6 w-full border border-primary bg-transparent px-4 py-[11px] text-[15px] font-medium text-foreground transition-colors hover:bg-paper-dim"
          >
            Continue with Google
          </button>

          <form onSubmit={onSubmit}>
            <div className="mb-5">
              <label htmlFor="email" className="mb-[6px] block text-sm text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="mb-[6px] block text-sm text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
            </div>

            {error ? <p className="mb-4 text-[13px] text-destructive">{error}</p> : null}
            {notice ? <p className="mb-4 text-[13px] text-revision">{notice}</p> : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full border border-primary bg-primary px-[22px] py-[11px] text-[14.5px] font-medium text-primary-foreground transition-colors hover:bg-ink-soft disabled:opacity-60"
            >
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-[14.5px] underline underline-offset-4 text-ink-soft hover:text-foreground"
          >
            {mode === "signin"
              ? "No account yet? Create one"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </Section>
    </main>
  );
}
