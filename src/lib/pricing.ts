/** Browser-safe pricing data. Base prices are in INR; other currencies are approximate conversions. */

export type PackId = "pack_1" | "pack_5" | "pack_10" | "pack_20";

export type Pack = { id: PackId; websites: number; baseInr: number; label: string; note: string };

export const PACKS: Pack[] = [
  { id: "pack_1", websites: 1, baseInr: 100, label: "Single", note: "Try it on one project." },
  { id: "pack_5", websites: 5, baseInr: 450, label: "Studio", note: "Save 10% per website." },
  { id: "pack_10", websites: 10, baseInr: 900, label: "Agency", note: "Save 10% per website." },
  { id: "pack_20", websites: 20, baseInr: 1800, label: "Scale", note: "Save 10% per website." },
];

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD" | "AUD" | "CAD";

/** Approximate INR → currency multipliers. Update these when you want to re-price. */
export const RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.017,
};

const EURO_COUNTRIES = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
]);

export function currencyForCountry(country: string | null | undefined): CurrencyCode {
  const c = (country ?? "").toUpperCase();
  if (c === "IN") return "INR";
  if (c === "GB") return "GBP";
  if (c === "AE") return "AED";
  if (c === "SG") return "SGD";
  if (c === "AU") return "AUD";
  if (c === "CA") return "CAD";
  if (EURO_COUNTRIES.has(c)) return "EUR";
  return "USD";
}

export function priceFor(pack: Pack, currency: CurrencyCode): number {
  if (currency === "INR") return pack.baseInr;
  return Math.round(pack.baseInr * RATES[currency] * 100) / 100;
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "INR" && Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function findPack(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}
