import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TEXT_EXT =
  /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py)$/i;

function isTextFile(name: string) {
  return TEXT_EXT.test(name);
}

type ChatTurn = { role: "user" | "assistant"; content: string };

// Rezyn Chat's model — OpenAI's GPT-6 Astra via Lovable's AI Gateway, at high reasoning
// effort. This is a frontier-tier model (materially more expensive and slower per turn
// than the flash model the style-based pipeline uses in redesign.functions.ts) — swap
// the string below if you'd rather trade some quality back for cost/speed.
const CHAT_MODEL = "openai/gpt-6-astra";
const CHAT_REASONING_EFFORT = "high";

async function chatRedesignSource(opts: {
  fileName: string;
  currentContent: string;
  instruction: string;
  history: ChatTurn[];
}): Promise<{ reply: string; file: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");

  const systemPrompt =
    "You are Rezyn Chat, a senior product designer and front-end engineer pairing with a " +
    "client to redesign one file from their product through conversation. You will be given " +
    "the file's current content and a new instruction, plus recent chat turns for context. " +
    "Apply exactly the requested change on top of the CURRENT content — do not start over from " +
    "scratch, do not revert earlier changes the client didn't ask you to undo, and keep " +
    "functionality, routes, data bindings, text meaning, and file format identical; only change " +
    "presentation (markup structure for layout, classes, CSS, design tokens, typography, " +
    "spacing, colors, states, responsiveness, accessibility). If the instruction is ambiguous, " +
    "make the single most reasonable interpretation rather than asking a question back. " +
    'Respond with ONLY a single JSON object and nothing else — no markdown fences, no ' +
    'commentary before or after — shaped exactly like {"reply": "...", "file": "..."}. ' +
    '"reply" is one short, friendly sentence (max ~25 words) telling the client what you ' +
    'changed, in plain language, for a chat bubble — never mention JSON or code. "file" is the ' +
    "complete rewritten file contents, correctly JSON-escaped.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...opts.history.map((turn) => ({ role: turn.role, content: turn.content })),
    {
      role: "user",
      content:
        `File name: ${opts.fileName}\n\n` +
        `Current file content:\n${opts.currentContent}\n\n` +
        `Instruction: ${opts.instruction}`,
    },
  ];

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      reasoning_effort: CHAT_REASONING_EFFORT,
      messages,
    }),
  });

  if (res.status === 429) throw new Error("Rate limit reached — try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let raw = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!raw) throw new Error("AI returned an empty response");
  raw = raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");

  const tryParse = (text: string) => {
    try {
      const parsed = JSON.parse(text) as { reply?: unknown; file?: unknown };
      if (typeof parsed.file === "string" && parsed.file.trim()) {
        const reply =
          typeof parsed.reply === "string" && parsed.reply.trim()
            ? parsed.reply.trim()
            : `Updated ${opts.fileName}.`;
        return { reply, file: parsed.file };
      }
    } catch {
      // not valid JSON
    }
    return null;
  };

  // First try the whole trimmed response as-is.
  const direct = tryParse(raw);
  if (direct) return direct;

  // Reasoning models occasionally prepend a line or two of commentary before the
  // JSON object despite instructions not to — try pulling out just the outermost
  // {...} block before giving up on structured output.
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = tryParse(raw.slice(firstBrace, lastBrace + 1));
    if (extracted) return extracted;
  }

  // The model didn't follow the JSON contract at all. Treat the whole response as
  // the file itself rather than failing the turn outright.
  return { reply: `Updated ${opts.fileName}.`, file: raw };
}

/** One turn of Rezyn Chat: apply a plain-language instruction to a single project file. */
export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        projectId: z.string().uuid(),
        fileId: z.string().uuid(),
        message: z.string().trim().min(1).max(4000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    const { data: file, error: fileError } = await supabase
      .from("project_files")
      .select("id, name, content, redesigned_content, storage_path, status")
      .eq("id", data.fileId)
      .eq("project_id", data.projectId)
      .maybeSingle();
    if (fileError) throw new Error(fileError.message);
    if (!file) throw new Error("File not found");

    const { data: history, error: historyError } = await supabase
      .from("redesign_chats")
      .select("role, content, created_at")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false })
      .limit(12);
    if (historyError) throw new Error(historyError.message);
    const chatHistory: ChatTurn[] = (history ?? [])
      .slice()
      .reverse()
      .map((row) => ({ role: row.role === "assistant" ? "assistant" : "user", content: row.content }));

    await supabase.from("redesign_chats").insert({
      project_id: data.projectId,
      user_id: userId,
      role: "user",
      content: data.message,
      file_name: file.name,
    });

    try {
      let currentContent = file.redesigned_content ?? file.content ?? "";
      if (!currentContent && file.storage_path) {
        if (!isTextFile(file.name)) throw new Error("Not a text-based file");
        const dl = await supabase.storage.from("project-files").download(file.storage_path);
        if (dl.error) throw new Error(dl.error.message);
        currentContent = await dl.data.text();
      }
      if (!currentContent.trim()) throw new Error("File is empty");

      await supabase
        .from("project_files")
        .update({ status: "redesigning", redesign_error: null })
        .eq("id", file.id);

      const { reply, file: updatedFile } = await chatRedesignSource({
        fileName: file.name,
        currentContent,
        instruction: data.message,
        history: chatHistory,
      });

      await supabase
        .from("project_files")
        .update({ status: "done", redesigned_content: updatedFile, redesign_error: null })
        .eq("id", file.id);

      await supabase.from("redesign_chats").insert({
        project_id: data.projectId,
        user_id: userId,
        role: "assistant",
        content: reply,
        file_name: file.name,
      });

      return { reply, fileName: file.name };
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "That edit failed";
      await supabase
        .from("project_files")
        .update({ status: "failed", redesign_error: messageText })
        .eq("id", file.id);
      await supabase.from("redesign_chats").insert({
        project_id: data.projectId,
        user_id: userId,
        role: "assistant",
        content: `Couldn't update ${file.name}: ${messageText}`,
        file_name: file.name,
      });
      throw new Error(messageText);
    }
  });
