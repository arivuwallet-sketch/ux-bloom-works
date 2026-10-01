import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { verifyOrder } from "@/lib/billing.functions";

export const Route = createFileRoute("/billing/return")({
  validateSearch: (search) => z.object({ order_id: z.string().optional() }).parse(search),
  head: () => ({
    meta: [
      { title: "Payment status | Rezyn" },
      { name: "description", content: "Confirming your Rezyn website credit purchase." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReturnPage,
});

type State = "checking" | "paid" | "pending" | "failed" | "error";

function ReturnPage() {
  const { order_id: orderId } = Route.useSearch();
  const { user, loading } = useAuth();
  const verify = useServerFn(verifyOrder);
  const [state, setState] = useState<State>("checking");
  const [credits, setCredits] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user || !orderId) return;
    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      try {
        const res = await verify({ data: { orderId } });
        if (cancelled) return;
        setCredits(res.credits);
        if (res.status === "pending" && attempts < 6) {
          attempts += 1;
          setState("pending");
          setTimeout(() => void check(), 3000);
          return;
        }
        setState(res.status);
      } catch (err) {
        if (cancelled) return;
        setMessage(err instanceof Error ? err.message : "Could not confirm payment.");
        setState("error");
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [loading, user, orderId, verify]);

  const view = !orderId
    ? { icon: XCircle, title: "No order found", body: "This page needs an order reference from the payment provider." }
    : !loading && !user
      ? { icon: Clock, title: "Sign in to confirm", body: "Sign in with the account you paid from and we'll confirm the order." }
      : state === "paid"
        ? { icon: CheckCircle2, title: "Payment confirmed", body: `${credits} website credit${credits === 1 ? "" : "s"} added to your account.` }
        : state === "failed"
          ? { icon: XCircle, title: "Payment not completed", body: "No money was taken for this order, or it expired. You can try again." }
          : state === "error"
            ? { icon: XCircle, title: "Couldn't confirm yet", body: message ?? "Please refresh in a minute." }
            : state === "pending"
              ? { icon: Clock, title: "Waiting for the bank", body: "Some payments take a moment. If money was debited, credits are added automatically once confirmed." }
              : { icon: Loader2, title: "Confirming payment…", body: "Checking with Cashfree." };

  const Icon = view.icon;
  return (
    <main className="legal-page">
      <div className="wrap">
        <div className="glass mx-auto max-w-[620px] p-10 text-center">
          <Icon className={`mx-auto h-10 w-10 text-revision${Icon === Loader2 ? " animate-spin" : ""}`} />
          <h1 className="mb-4 mt-6 text-[48px] leading-none">{view.title}</h1>
          <p className="mx-auto max-w-[44ch] text-[15px] leading-7 text-ink-soft">{view.body}</p>
          {orderId ? <p className="font-mono text-[11px] text-muted-foreground">Order {orderId}</p> : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!user && !loading ? (
              <Link to="/auth" className="button-primary">Sign in</Link>
            ) : (
              <Link to="/projects" className="button-primary">Go to workspace</Link>
            )}
            <Link to="/pricing" className="button-secondary">Pricing</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
