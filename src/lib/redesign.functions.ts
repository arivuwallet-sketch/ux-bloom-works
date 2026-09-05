import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TEXT_EXT =
  /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py)$/i;

function isTextFile(name: string) {
  return TEXT_EXT.test(name);
}

async function redesignSource(opts: {
  name: string;
  style: string;
  source: string;
}): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a senior product designer and front-end engineer. You receive one source file from an existing product and rewrite its UI so it matches a requested visual style. Rules: keep all functionality, routes, data, text meaning and file format identical; only change presentation (markup structure for layout, classes, CSS, design tokens, typography, spacing, colors, states, responsiveness, accessibility). Never add explanations, never wrap the answer in markdown code fences. Return ONLY the complete rewritten file contents.",
        },
        {
          role: "user",
          content: `File name: ${opts.name}\nTarget design style: ${opts.style}\n\nRewrite this file in the "${opts.style}" style:\n\n${opts.source}`,
        },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Rate limit reached — try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let out = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!out) throw new Error("AI returned an empty file");
  out = out.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");
  return out;
}

/** Redesigns the next queued file and reports what is left. */
export const redesignNextFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, target_style, style_mode, status")
      .eq("id", data.projectId)
      .maybeSingle();
    if (projectError) throw new Error(projectError.message);
    if (!project) throw new Error("Project not found");

    const { data: files, error: filesError } = await supabase
      .from("project_files")
      .select("id, name, source, content, storage_path, target_style, status")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: true });
    if (filesError) throw new Error(filesError.message);

    const queue = (files ?? []).filter((f) => f.status !== "done" && f.status !== "skipped");
    const file = queue[0];

    if (!file) {
      await supabase.from("projects").update({ status: "done" }).eq("id", data.projectId);
      return { done: true as const, remaining: 0, total: files?.length ?? 0, current: null };
    }

    await supabase.from("projects").update({ status: "redesigning" }).eq("id", data.projectId);
    await supabase
      .from("project_files")
      .update({ status: "redesigning", redesign_error: null })
      .eq("id", file.id);

    try {
      let source = file.content ?? "";
      if (!source && file.storage_path) {
        if (!isTextFile(file.name)) {
          await supabase
            .from("project_files")
            .update({ status: "skipped", redesign_error: "Not a text-based file" })
            .eq("id", file.id);
          return {
            done: false as const,
            remaining: queue.length - 1,
            total: files?.length ?? 0,
            current: file.name,
          };
        }
        const dl = await supabase.storage.from("project-files").download(file.storage_path);
        if (dl.error) throw new Error(dl.error.message);
        source = await dl.data.text();
      }
      if (!source.trim()) throw new Error("File is empty");

      const style =
        (project.style_mode === "file" ? file.target_style : project.target_style) ??
        file.target_style ??
        project.target_style;
      if (!style) throw new Error("No target style selected");

      const redesigned = await redesignSource({ name: file.name, style, source });

      await supabase
        .from("project_files")
        .update({ status: "done", redesigned_content: redesigned, redesign_error: null })
        .eq("id", file.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Redesign failed";
      await supabase
        .from("project_files")
        .update({ status: "failed", redesign_error: message })
        .eq("id", file.id);
      throw new Error(message);
    }

    return {
      done: false as const,
      remaining: queue.length - 1,
      total: files?.length ?? 0,
      current: file.name,
    };
  });

/** Puts every file back in the queue so the whole project is redesigned again. */
export const resetRedesign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ projectId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("project_files")
      .update({ status: "queued", redesigned_content: null, redesign_error: null })
      .eq("project_id", data.projectId);
    if (error) throw new Error(error.message);
    await context.supabase
      .from("projects")
      .update({ status: "queued" })
      .eq("id", data.projectId);
    return { ok: true };
  });
