import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Access workspace — Rezyn" },
      { name: "description", content: "Sign in to the Rezyn interface transformation workspace." },
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
              <span>{mode === "signin" ? "Sign in" : "Create account"}</span>
              <span>RZ / 26</span>
            </div>

            <button type="button" onClick={onGoogle} className="button-secondary archive-auth__google">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path fill="currentColor" d="M12 11v2.9h6.9c-.3 1.8-2.1 5.2-6.9 5.2-4.2 0-7.6-3.4-7.6-7.6S7.8 3.9 12 3.9c2.4 0 4 1 4.9 1.9l3.3-3.2C18.1 1 15.3 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2z" />
              </svg>
              Continue with Google
            </button>

            <div className="archive-auth__divider"><span>OR USE EMAIL</span></div>

            <form onSubmit={onSubmit} className="archive-auth__form">
              <div>
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="field" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="field" placeholder="Minimum 6 characters" />
              </div>

              {error ? <p className="archive-auth__error">{error}</p> : null}
              {notice ? <p className="archive-auth__notice">{notice}</p> : null}

              <button type="submit" disabled={busy} className="button-primary archive-auth__submit">
                {busy ? "Connecting…" : mode === "signin" ? "Enter workspace" : "Create workspace"}
                {!busy ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </form>

            <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="archive-auth__switch">
              {mode === "signin" ? "New to Rezyn? Create an account" : "Already have an account? Sign in"}
            </button>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
