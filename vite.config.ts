// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const creditGateBlock = /\n\s*const \{ data: unlocked, error: unlockError \} = await supabase\.rpc\("unlock_project", \{ _project_id: data\.projectId \}\);\n\s*if \(unlockError\) throw new Error\(unlockError\.message\);\n\s*if \(!unlocked\) throw new Error\("NO_CREDITS: You need a website credit to redesign this project\. Buy a pack on the Pricing page\."\);\n/g;

function paymentGateDisabledPlugin() {
  return {
    name: "rezyn-payment-gate-disabled",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      const target =
        id.includes("/src/lib/redesign.functions.ts") ||
        id.includes("/src/lib/chat-redesign.functions.ts");
      if (!target) return null;

      const transformed = code.replace(
        creditGateBlock,
        "\n    // Pricing/payment gate intentionally disabled; authenticated project ownership checks remain active.\n",
      );

      if (transformed === code) {
        this.error(`Expected project credit gate was not found in ${id}`);
      }

      return { code: transformed, map: null };
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [paymentGateDisabledPlugin()],
  },
});
