import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

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

const creditGateBlock = /const\s+\{\s*data:\s*unlocked,\s*error:\s*unlockError\s*\}\s*=\s*await\s+supabase\.rpc\(\s*["']unlock_project["']\s*,\s*\{\s*_project_id:\s*data\.projectId\s*\}\s*\);\s*if\s*\(unlockError\)\s*throw\s+new\s+Error\(unlockError\.message\);\s*if\s*\(!unlocked\)\s*throw\s+new\s+Error\(\s*["']NO_CREDITS: You need a website credit to redesign this project\. Buy a pack on the Pricing page\.["']\s*\);?/g;
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
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  plugins: [
    rezynRuntimeSourceWiringPlugin(),
    tsConfigPaths(),
    tanstackStart(),
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
});
