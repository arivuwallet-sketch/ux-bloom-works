// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { STYLE_NAMES } from "./src/lib/style-blueprints";
import { certifyAllDesignDirections, compileDirectionCss } from "./src/lib/design-direction-compiler";
import { validateRedesignCssCompatibility } from "./src/lib/css-redesign-validator";

const certification = certifyAllDesignDirections();
for (const style of STYLE_NAMES) {
  const css = compileDirectionCss(style, true);
  validateRedesignCssCompatibility({
    name: "styles.css",
    source: '@import "tailwindcss";',
    output: css,
    style,
  });
}
if (!certification.passed || certification.directions !== 61) {
  throw new Error("Rezyn direction compiler certification did not cover all 61 directions.");
}

const projectFoundGuard = /if\s*\(!project\)\s*throw\s+new\s+Error\(\s*["']Project not found["']\s*\);?/;
const artifactImport = 'import { ensureProjectArtifacts } from "@/lib/project-artifact-orchestrator";';

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