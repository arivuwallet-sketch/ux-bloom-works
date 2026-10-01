/** Server-only Cashfree Payment Gateway helpers (production API). */

const CF_BASE = "https://api.cashfree.com/pg";
const CF_VERSION = "2023-08-01";

function credentials() {
  const appId = process.env["CASHFREE_APP_ID"];
  const secret = process.env["CASHFREE_SECRET_KEY"];
  if (!appId || !secret) throw new Error("Payments are not configured yet.");
  return { appId, secret };
}

async function cfFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { appId, secret } = credentials();
  const res = await fetch(`${CF_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-client-id": appId,
      "x-client-secret": secret,
      "x-api-version": CF_VERSION,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) {
    const message = typeof body["message"] === "string" ? body["message"] : `Payment provider error (${res.status})`;
    console.error("Cashfree error", res.status, body);
    throw new Error(message);
  }
  return body as T;
}

export type CfOrder = {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED" | "TERMINATION_REQUESTED";
  payment_session_id?: string;
};

export function createCfOrder(input: {
  orderId: string;
  amount: number;
  currency: string;
  customerId: string;
  email: string;
  phone: string;
  name?: string;
  returnUrl: string;
  notifyUrl?: string;
  note: string;
}) {
  return cfFetch<CfOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: input.currency,
      order_note: input.note,
      customer_details: {
        customer_id: input.customerId,
        customer_email: input.email,
        customer_phone: input.phone,
        ...(input.name ? { customer_name: input.name } : {}),
      },
      order_meta: {
        return_url: input.returnUrl,
        ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
      },
    }),
  });
}

export function getCfOrder(orderId: string) {
  return cfFetch<CfOrder>(`/orders/${encodeURIComponent(orderId)}`);
}

async function getSuccessfulPaymentId(orderId: string): Promise<string | null> {
  try {
    const payments = await cfFetch<Array<{ cf_payment_id?: string | number; payment_status?: string }>>(
      `/orders/${encodeURIComponent(orderId)}/payments`,
    );
    const ok = payments.find((p) => p.payment_status === "SUCCESS");
    return ok?.cf_payment_id != null ? String(ok.cf_payment_id) : null;
  } catch {
    return null;
  }
}

/**
 * Re-checks the order directly with Cashfree and credits the buyer exactly once.
 * Returns the stored purchase status after the check.
 */
export async function reconcileOrder(orderId: string): Promise<"paid" | "pending" | "failed"> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: purchase } = await supabaseAdmin
    .from("credit_purchases")
    .select("order_id, amount, currency, status")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!purchase) throw new Error("Order not found");
  if (purchase.status === "paid") return "paid";

  const order = await getCfOrder(orderId);
  const amountMatches =
    Math.abs(Number(order.order_amount) - Number(purchase.amount)) < 0.01 && order.order_currency === purchase.currency;

  if (order.order_status === "PAID" && amountMatches) {
    const paymentId = await getSuccessfulPaymentId(orderId);
    await supabaseAdmin.rpc("fulfill_credit_purchase", { _order_id: orderId, _cf_payment_id: paymentId ?? "" });
    return "paid";
  }
  if (order.order_status === "EXPIRED" || order.order_status === "TERMINATED") {
    await supabaseAdmin.from("credit_purchases").update({ status: "failed" }).eq("order_id", orderId).neq("status", "paid");
    return "failed";
  }
  return "pending";
}
