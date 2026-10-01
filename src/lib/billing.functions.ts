import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { reconcileOrder } from "@/lib/cashfree.server";
import { currencyForCountry, PACKS, priceFor } from "@/lib/pricing";

function visitorCurrency() {
  const country = getRequestHeader("cf-ipcountry") ?? getRequestHeader("x-vercel-ip-country") ?? null;
  return { country, currency: currencyForCountry(country) };
}

/** Public: prices in the visitor's local currency. */
export const getPricing = createServerFn({ method: "GET" }).handler(async () => {
  const { country, currency } = visitorCurrency();
  return {
    country,
    currency,
    packs: PACKS.map((p) => ({
      id: p.id,
      websites: p.websites,
      label: p.label,
      note: p.note,
      bestFor: p.bestFor,
      amount: priceFor(p, currency),
    })),
  };
});

/** Signed-in: remaining credits and purchase history. */
export const getBilling = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: credits }, { data: purchases }] = await Promise.all([
      context.supabase.from("user_credits").select("balance").eq("user_id", context.userId).maybeSingle(),
      context.supabase
        .from("credit_purchases")
        .select("order_id, pack_id, credits, amount, currency, status, created_at, paid_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    return { balance: credits?.balance ?? 0, purchases: purchases ?? [] };
  });

/**
 * Checkout is intentionally disconnected.
 * Keep this server function exported so stale clients fail safely instead of
 * reaching the payment provider or creating pending purchase records.
 */
export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        packId: z.string(),
        phone: z.string().optional().default(""),
      })
      .parse(data),
  )
  .handler(async () => {
    throw new Error("Payments are currently disabled.");
  });

/** Existing orders can still be reconciled safely if a user returns from an older checkout. */
export const verifyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ orderId: z.string().regex(/^rz_[0-9]+_[a-f0-9]{8}$/) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: own } = await context.supabase
      .from("credit_purchases")
      .select("order_id, credits")
      .eq("order_id", data.orderId)
      .maybeSingle();
    if (!own) throw new Error("Order not found");
    const status = await reconcileOrder(data.orderId);
    return { status, credits: own.credits };
  });

/**
 * Pricing/checkout is disconnected, so project transformations are currently
 * unrestricted. Keep this API shape for the existing console and switch it back
 * to the persisted credit lookup when payments are re-enabled.
 */
export const getProjectAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async () => ({ unlocked: true, balance: 0 }));
