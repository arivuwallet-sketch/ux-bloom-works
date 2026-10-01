import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createCfOrder, reconcileOrder } from "@/lib/cashfree.server";
import { currencyForCountry, findPack, PACKS, priceFor } from "@/lib/pricing";

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

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        packId: z.string(),
        phone: z
          .string()
          .trim()
          .regex(/^\+?[0-9]{8,15}$/, "Enter a valid phone number (digits only, optional +country code)."),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const pack = findPack(data.packId);
    if (!pack) throw new Error("Unknown pack");

    const email = typeof context.claims["email"] === "string" ? (context.claims["email"] as string) : null;
    if (!email) throw new Error("Your account needs an email address to pay.");

    const { currency } = visitorCurrency();
    const amount = priceFor(pack, currency);

    const origin = getRequestHeader("origin");
    if (!origin || !/^https?:\/\//.test(origin)) throw new Error("Could not determine return address.");
    const isHttps = origin.startsWith("https://");

    const orderId = `rz_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insertError } = await supabaseAdmin.from("credit_purchases").insert({
      user_id: context.userId,
      order_id: orderId,
      pack_id: pack.id,
      credits: pack.websites,
      amount,
      currency,
      status: "pending",
    });
    if (insertError) throw new Error(insertError.message);

    const order = await createCfOrder({
      orderId,
      amount,
      currency,
      customerId: context.userId.replace(/-/g, ""),
      email,
      phone: data.phone.replace(/^\+91/, ""),
      returnUrl: `${origin}/billing/return?order_id={order_id}`,
      ...(isHttps ? { notifyUrl: `${origin}/api/public/cashfree/webhook` } : {}),
      note: `Rezyn ${pack.websites} website redesign${pack.websites > 1 ? "s" : ""}`,
    });
    if (!order.payment_session_id) throw new Error("Payment provider did not return a session.");
    return { orderId, paymentSessionId: order.payment_session_id };
  });

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

/** Signed-in: whether a project has already been unlocked with a credit. */
export const getProjectAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const [{ data: unlock }, { data: credits }] = await Promise.all([
      context.supabase.from("project_unlocks").select("project_id").eq("project_id", data.projectId).maybeSingle(),
      context.supabase.from("user_credits").select("balance").eq("user_id", context.userId).maybeSingle(),
    ]);
    return { unlocked: Boolean(unlock), balance: credits?.balance ?? 0 };
  });
