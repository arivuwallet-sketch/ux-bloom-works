import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createCheckout } from "@/lib/billing.functions";

export function BuyPackButton({ packId, label, featured }: { packId: string; label: string; featured?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckout);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    if (!user) {
      void navigate({ to: "/auth", search: { next: "/pricing" } });
      return;
    }
    setError(null);
    setOpen(true);
  };

  const pay = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { paymentSessionId } = await checkout({ data: { packId, phone } });
      const { load } = await import("@cashfreepayments/cashfree-js");
      const cashfree = await load({ mode: "production" });
      await cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={start} className={`${featured ? "button-primary" : "button-secondary"} w-full justify-center`}>
        {label} <ArrowUpRight className="h-4 w-4" />
      </button>

      {open ? (
        <div className="pay-dialog" role="dialog" aria-modal="true" aria-labelledby={`pay-${packId}`}>
          <form onSubmit={pay} className="pay-dialog__panel glass">
            <div className="flex items-start justify-between gap-4">
              <h3 id={`pay-${packId}`} className="m-0 text-[32px] leading-none">Checkout</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="pay-dialog__close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="m-0 text-[14px] leading-6 text-ink-soft">
              Payments are processed securely by Cashfree. Your card or UPI details never touch Rezyn. The payment provider
              requires a phone number for the receipt.
            </p>
            <label htmlFor={`phone-${packId}`} className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
              Phone number
            </label>
            <input
              id={`phone-${packId}`}
              className="field"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
            />
            {error ? <p className="m-0 text-[13px] text-destructive">{error}</p> : null}
            <button type="submit" disabled={busy} className="button-primary justify-center disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy ? "Opening secure checkout…" : "Continue to payment"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
