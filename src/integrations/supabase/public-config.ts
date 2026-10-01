// Public Supabase connection metadata used by the browser and authenticated server middleware.
// These values are intentionally client-safe: a Supabase project URL and publishable key are
// designed to be exposed to browser applications. Never place service-role or other secrets here.
export const DEFAULT_SUPABASE_URL = "https://zcnkzvkjnxlplrvhjoxf.supabase.co";
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LDIpo1Vnbhs86d3IZ2Dpyg_DmcSb9Ev";

export function getBrowserSupabaseConfig() {
  const url = import.meta.env["VITE_SUPABASE_URL"] || DEFAULT_SUPABASE_URL;
  const publishableKey =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return { url, publishableKey };
}
