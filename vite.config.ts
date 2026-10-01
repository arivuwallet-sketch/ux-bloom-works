// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const creditGateBlock = /const\s+\{\s*data:\s*unlocked,\s*error:\s*unlockError\s*\}\s*=\s*await\s+supabase\.rpc\(\s*["']unlock_project["']\s*,\s*\{\s*_project_id:\s*data\.projectId\s*\}\s*\);\s*if\s*\(unlockError\)\s*throw\s+new\s+Error\(unlockError\.message\);\s*if\s*\(!unlocked\)\s*throw\s+new\s+Error\(\s*["']NO_CREDITS: You need a website credit to redesign this project\. Buy a pack on the Pricing page\.["']\s*\);?/g;
const projectFoundGuard = /if\s*\(!project\)\s*throw\s+new\s+Error\(\s*["']Project not found["']\s*\);?/;
const artifactImport = 'import { ensureProjectArtifacts } from "@/lib/project-artifact-bootstrap";';

function injectArtifactBootstrap(source: string, call: string, file: string) {
  if (source.includes(artifactImport)) return source;
  const withImport = `${artifactImport}\n${source}`;
  const transformed = withImport.replace(projectFoundGuard, (match) => `${match}\n\n    ${call}`);
  if (transformed === withImport) {
    throw new Error(`Expected project guard was not found while wiring artifact bootstrap in ${file}`);
  }
  return transformed;
}

function rezynRuntimeSourceWiringPlugin() {
  return {
    name: "rezyn-runtime-source-wiring",
    enforce: "pre" as const,
    load(id: string) {
      const cleanId = id.split("?", 1)[0] ?? id;
      const isRedesign = cleanId.endsWith("/src/lib/redesign.functions.ts");
      const isSeo = cleanId.endsWith("/src/lib/seo.functions.ts");
      const isChat = cleanId.endsWith("/src/lib/chat-redesign.functions.ts");
      if (!isRedesign && !isSeo && !isChat) return null;

      const source = readFileSync(cleanId, "utf8");
      let transformed = source;

      if (isRedesign) {
        transformed = injectArtifactBootstrap(
          transformed,
          'await ensureProjectArtifacts({ engine: "redesign", supabase, projectId: data.projectId, userId: context.userId, sourceMode: "original" });',
          cleanId,
        );
      } else if (isSeo) {
        transformed = injectArtifactBootstrap(
          transformed,
          'await ensureProjectArtifacts({ engine: "seo", supabase: db, projectId: data.projectId, userId: context.userId, sourceMode: data.sourceMode });',
          cleanId,
        );
      }

      if (isRedesign || isChat) {
        const withoutPaymentGate = transformed.replace(
          creditGateBlock,
          "// Pricing/payment gate intentionally disabled; authenticated project ownership checks remain active.",
        );
        if (withoutPaymentGate === transformed) {
          throw new Error(`Expected project credit gate was not found in ${cleanId}`);
        }
        transformed = withoutPaymentGate;
      }

      return transformed;
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
    plugins: [rezynRuntimeSourceWiringPlugin()],
  },
});