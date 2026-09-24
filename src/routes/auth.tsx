import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Reveal, SplitText } from "@/components/studio/motion";
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
        <div className="relative mx-auto max-w-[440px]">
          <span
            aria-hidden
            className="outline-text pointer-events-none absolute -top-[70px] right-[-20px] hidden font-serif text-[110px] leading-none sm:block"
          >
            →
          </span>
          <Reveal>
            <div className="glass relative z-10 inline-flex items-center gap-2 px-4 py-2 text-[11px] tracking-[0.3em] text-revision uppercase">
              <Sparkles className="h-3 w-3" />
              workspace access
            </div>
            <h1 className="relative z-10 mt-6 mb-[10px] text-[15vw] leading-[0.9] sm:text-[46px]">
              <SplitText text={mode === "signin" ? "Sign in" : "Create an account"} delay={0.05} />
            </h1>
            <p className="relative z-10 mb-8 text-[15.5px] text-ink-soft">
              Your workspace holds your uploaded project files, the styles you pick, and any new
              files you write here.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <button
              type="button"
              onClick={onGoogle}
              className="glass mb-6 flex w-full items-center justify-center gap-3 px-4 py-[13px] text-[15px] font-medium text-foreground transition-colors hover:border-revision/50 hover:text-revision"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  fill="currentColor"
                  d="M12 11v2.9h6.9c-.3 1.8-2.1 5.2-6.9 5.2-4.2 0-7.6-3.4-7.6-7.6S7.8 3.9 12 3.9c2.4 0 4 1 4.9 1.9l3.3-3.2C18.1 1 15.3 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2z"
                />
              </svg>
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
                  className="field"
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
                  className="field"
                />
              </div>

              {error ? <p className="mb-4 text-[13px] text-destructive">{error}</p> : null}
              {notice ? <p className="mb-4 text-[13px] text-revision">{notice}</p> : null}

              <button
                type="submit"
                disabled={busy}
                className="glow-aurora w-full bg-revision px-[22px] py-[13px] text-[14px] font-semibold tracking-[0.08em] text-primary-foreground uppercase transition-transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-60"
              >
                {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-6 text-[14.5px] text-ink-soft underline underline-offset-4 hover:text-revision"
            >
              {mode === "signin"
                ? "No account yet? Create one"
                : "Already have an account? Sign in"}
            </button>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
