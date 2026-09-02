import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const auditRequestSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(200),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  productUrl: z
    .string()
    .trim()
    .max(400)
    .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v), "Enter a full URL starting with https://")
    .optional()
    .or(z.literal("")),
  productType: z.string().trim().min(1, "Pick what we're revising").max(60),
  budgetRange: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;

export const submitAuditRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => auditRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { error } = await supabase.from("audit_requests").insert({
      name: data.name,
      email: data.email,
      company: data.company || null,
      product_url: data.productUrl || null,
      product_type: data.productType,
      budget_range: data.budgetRange || null,
      message: data.message || null,
    });

    if (error) {
      console.error("audit_requests insert failed", error);
      throw new Error("We couldn't save your request. Please try again.");
    }

    return { ok: true as const };
  });
