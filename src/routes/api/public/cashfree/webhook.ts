import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { reconcileOrder } from "@/lib/cashfree.server";

export const Route = createFileRoute("/api/public/cashfree/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CASHFREE_SECRET_KEY"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const signature = request.headers.get("x-webhook-signature") ?? "";
        const timestamp = request.headers.get("x-webhook-timestamp") ?? "";
        const raw = await request.text();

        const expected = createHmac("sha256", secret)
          .update(timestamp + raw)
          .digest("base64");
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (!signature || a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let orderId: string | undefined;
        try {
          const payload = JSON.parse(raw) as { data?: { order?: { order_id?: string } } };
          orderId = payload.data?.order?.order_id;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }
        if (!orderId || !/^rz_[0-9]+_[a-f0-9]{8}$/.test(orderId)) return new Response("ok");

        try {
          // Never trust the webhook body alone — reconcile re-reads the order from Cashfree.
          await reconcileOrder(orderId);
        } catch (err) {
          console.error("Cashfree webhook reconcile failed", err);
          return new Response("retry", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
