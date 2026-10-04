import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | Rezyn" },
      { name: "description", content: "Choose a new password for your Rezyn account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session || window.location.hash.includes("type=recovery")) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => void navigate({ to: "/projects" }), 1200);
  };

  return (
    <main className="archive-auth">
      <div className="wrap">
        <div className="archive-auth__grid">
          <div className="archive-auth__intro">
            <div className="archive-auth__index">RESET / PASSWORD</div>
            <h1>New password.</h1>
            <p>Choose a password you haven't used before. At least 8 characters.</p>
          </div>
          <div className="archive-auth__panel">
            {done ? (
              <p className="archive-auth__notice">
                Password updated. Taking you to your workspace…
              </p>
            ) : !ready ? (
              <p className="archive-auth__notice">
                Open this page from the reset link in your email. Link expired?{" "}
                <Link to="/auth">Request a new one</Link>.
              </p>
            ) : (
              <form onSubmit={submit} className="archive-auth__form">
                <div>
                  <label htmlFor="np">New password</label>
                  <input
                    id="np"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="cp">Confirm password</label>
                  <input
                    id="cp"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="field"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
                {error ? <p className="archive-auth__error">{error}</p> : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="button-primary archive-auth__submit"
                >
                  {busy ? "Saving…" : "Save password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
