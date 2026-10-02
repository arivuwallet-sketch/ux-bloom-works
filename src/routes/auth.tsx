import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const safeNext = (value: string | undefined) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/projects";

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => z.object({ next: z.string().optional() }).parse(search),
  head: () => ({
    meta: [
      { title: "Access workspace — Rezyn" },
      { name: "description", content: "Sign in to the Rezyn interface transformation workspace." },
      { property: "og:title", content: "Sign in — Rezyn" },
      { property: "og:description", content: "Sign in or create your Rezyn workspace account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const destination = safeNext(next);
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    const stored = sessionStorage.getItem("rezyn.auth.next");
    sessionStorage.removeItem("rezyn.auth.next");
    void navigate({ to: stored ? safeNext(stored) : destination });
  }, [loading, user, navigate, destination]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "forgot") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (err) throw err;
        setNotice("If an account exists for that email, a reset link is on its way.");
      } else if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (err) throw err;
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          setError("An account with this email already exists. Sign in instead, or reset your password.");
          setMode("signin");
        } else if (data.session) {
          void navigate({ to: destination });
        } else {
          setNotice("Almost there — open the confirmation link we just emailed you, then sign in.");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          if (/email not confirmed/i.test(err.message)) throw new Error("Please confirm your email first — check your inbox for the link.");
          if (/invalid login credentials/i.test(err.message)) throw new Error("Email or password is incorrect.");
          throw err;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setGoogleBusy(true);
    try {
      if (next) sessionStorage.setItem("rezyn.auth.next", destination);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth` },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <main className="archive-auth">
      <div className="wrap">
        <div className="archive-auth__rule">
          <span>REZYN / WORKSPACE ACCESS</span>
          <span>SECURE ENTRY / 01</span>
        </div>

        <div className="archive-auth__grid">
          <Reveal className="archive-auth__intro">
            <div className="archive-auth__index">01 / AUTH</div>
            <h1>Continue the transformation.</h1>
            <p>
              Projects, source files, visual directions, redesign output and chat history remain connected to one workspace.
            </p>
            <div className="archive-auth__stamp">
              <ShieldCheck className="h-5 w-5" />
              <div>
                <strong>Private workspace</strong>
                <span>Identity linked / source continuity</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="archive-auth__panel">
            <div className="archive-auth__panel-head">
              <span>{mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}</span>
              <span>RZ / 26</span>
            </div>

            <button type="button" onClick={() => void onGoogle()} disabled={googleBusy} className="button-secondary archive-auth__google disabled:opacity-60">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path fill="currentColor" d="M12 11v2.9h6.9c-.3 1.8-2.1 5.2-6.9 5.2-4.2 0-7.6-3.4-7.6-7.6S7.8 3.9 12 3.9c2.4 0 4 1 4.9 1.9l3.3-3.2C18.1 1 15.3 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2z" />
              </svg>
              {googleBusy ? "Opening Google…" : "Continue with Google"}
            </button>

            <div className="archive-auth__divider"><span>OR USE EMAIL</span></div>

            <form onSubmit={onSubmit} className="archive-auth__form">
              <div>
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="field" placeholder="you@example.com" />
              </div>
              {mode !== "forgot" ? (
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={mode === "signup" ? 8 : 6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="field"
                    placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                  />
                  {mode === "signin" ? (
                    <button type="button" onClick={() => { setMode("forgot"); setError(null); setNotice(null); }} className="archive-auth__switch" style={{ marginTop: 8 }}>
                      Forgot password?
                    </button>
                  ) : null}
                </div>
              ) : null}

              {error ? <p className="archive-auth__error">{error}</p> : null}
              {notice ? <p className="archive-auth__notice">{notice}</p> : null}

              <button type="submit" disabled={busy} className="button-primary archive-auth__submit">
                {busy ? "Connecting…" : mode === "signin" ? "Enter workspace" : mode === "signup" ? "Create workspace" : "Send reset link"}
                {!busy ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </form>

            <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setNotice(null); }} className="archive-auth__switch">
              {mode === "signin" ? "New to Rezyn? Create an account" : "Already have an account? Sign in"}
            </button>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
