import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Fingerprint, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Access workspace — Rezyn" },
      {
        name: "description",
        content: "Sign in to the Rezyn interface transformation workspace.",
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
    <main className="px-0 pb-24 pt-[126px] sm:pt-[150px]">
      <div className="wrap">
        <div className="grid min-h-[680px] grid-cols-1 overflow-hidden rounded-[30px] border border-white/10 bg-[#07101f]/70 shadow-[0_40px_140px_rgba(0,0,0,.38)] backdrop-blur-2xl lg:grid-cols-[1.05fr_.95fr]">
          <Reveal className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(96,244,255,.12),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(139,124,255,.12),transparent_36%)]" />
            <div className="absolute -right-36 top-10 h-[520px] w-[520px] rounded-full border border-revision/10 shadow-[0_0_120px_rgba(96,244,255,.06)]" />
            <div className="absolute -right-12 top-32 h-[280px] w-[280px] rotate-45 border border-violet/20" />
            <div className="relative z-10 flex h-full flex-col">
              <span className="eyebrow">Secure workspace gateway</span>
              <h1 className="mt-8 max-w-[9ch] text-[clamp(56px,6vw,92px)] leading-[0.86]">
                Continue the transformation.
              </h1>
              <p className="mt-7 max-w-[520px] text-[16px] leading-8 text-ink-soft">
                Projects, uploaded source files, design directions, AI redesign output and chat history stay connected to your workspace.
              </p>

              <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="glass p-5">
                  <Fingerprint className="h-5 w-5 text-revision" />
                  <div className="mt-8 text-[14px] font-medium">Identity linked</div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.1em] text-muted-foreground">PROJECT CONTINUITY</div>
                </div>
                <div className="glass p-5">
                  <ShieldCheck className="h-5 w-5 text-revision" />
                  <div className="mt-8 text-[14px] font-medium">Private workspace</div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.1em] text-muted-foreground">SOURCE CONTROL</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="flex items-center p-6 sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-[460px]">
              <div className="mb-9 flex items-center justify-between gap-4">
                <div>
                  <span className="eyebrow">Workspace access</span>
                  <h2 className="mb-0 mt-4 text-[46px] leading-none">
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </h2>
                </div>
                <Sparkles className="h-6 w-6 text-revision" />
              </div>

              <button
                type="button"
                onClick={onGoogle}
                className="button-secondary mb-6 w-full"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M12 11v2.9h6.9c-.3 1.8-2.1 5.2-6.9 5.2-4.2 0-7.6-3.4-7.6-7.6S7.8 3.9 12 3.9c2.4 0 4 1 4.9 1.9l3.3-3.2C18.1 1 15.3 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="mb-6 flex items-center gap-4 text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-[9px] tracking-[0.12em]">OR USE EMAIL</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="field"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="field"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                {error ? <p className="m-0 text-[13px] text-destructive">{error}</p> : null}
                {notice ? <p className="m-0 text-[13px] text-revision">{notice}</p> : null}

                <button type="submit" disabled={busy} className="button-primary w-full disabled:opacity-50">
                  {busy ? "Connecting…" : mode === "signin" ? "Enter workspace" : "Create workspace"}
                  {!busy ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-6 border-0 bg-transparent p-0 text-[13px] text-ink-soft underline decoration-white/20 underline-offset-4 transition-colors hover:text-revision"
              >
                {mode === "signin" ? "New to Rezyn? Create an account" : "Already have an account? Sign in"}
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
