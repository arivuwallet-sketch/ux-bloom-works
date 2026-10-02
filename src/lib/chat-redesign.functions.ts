import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildDesignIntelligenceContext } from "@/lib/design-intelligence";
import { repairRedesignCssCompatibility, validateRedesignCssCompatibility } from "@/lib/css-redesign-validator";

const TEXT_EXT =
  /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py)$/i;

const MAX_SOURCE_CHARS = 300_000;
const CHAT_MODELS = ["openai/gpt-6-astra", "google/gemini-2.5-flash"] as const;
const CHAT_REASONING_EFFORT = "high";
const TRANSIENT_STATUS = new Set([408, 429, 500, 502, 503, 504]);

type ChatTurn = { role: "user" | "assistant"; content: string };
type GatewayMessage = { role: "system" | "user" | "assistant"; content: string };
type RedesignResult = { reply: string; file: string; model: string };
type ChatMode = "conversation" | "redesign";
type IntentResult = { mode: ChatMode; reply: string; model: string | null };

function isTextFile(name: string) {
  return TEXT_EXT.test(name);
}

function extensionOf(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function stripOuterFence(value: string) {
  return value.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "").trim();
}

function validateGeneratedFile(fileName: string, original: string, candidate: string, style?: string | null) {
  const output = candidate.trim();
  if (!output) throw new Error("AI returned an empty file");

  if (original.length > 4_000 && output.length < original.length * 0.15) {
    throw new Error("AI output looks truncated");
  }

  const ext = extensionOf(fileName);
  if (ext === "json") {
    try {
      JSON.parse(output);
    } catch {
      throw new Error("AI returned invalid JSON");
    }
  }

  if (!["md", "mdx", "txt"].includes(ext) && /^```/.test(output)) {
    throw new Error("AI returned markdown instead of source code");
  }

  if (/^(here(?:'s| is)|sure[,!]|i(?:'ve| have) updated)/i.test(output)) {
    throw new Error("AI returned commentary instead of a complete source file");
  }

  validateRedesignCssCompatibility({ name: fileName, source: original, output, style });

  return output;
}

function parseStructuredResult(rawValue: string, fileName: string, original: string, style?: string | null) {
  const raw = stripOuterFence(rawValue);

  const parse = (text: string) => {
    try {
      const parsed = JSON.parse(text) as { reply?: unknown; file?: unknown };
      if (typeof parsed.file !== "string") return null;
      const file = validateGeneratedFile(fileName, original, parsed.file, style);
      const reply =
        typeof parsed.reply === "string" && parsed.reply.trim()
          ? parsed.reply.trim().slice(0, 500)
          : `Updated ${fileName}.`;
      return { reply, file };
    } catch {
      return null;
    }
  };

  const direct = parse(raw);
  if (direct) return direct;

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = parse(raw.slice(firstBrace, lastBrace + 1));
    if (extracted) return extracted;
  }

  return null;
}

function parseIntentResult(rawValue: string, model: string): IntentResult | null {
  const raw = stripOuterFence(rawValue);

  const parse = (text: string): IntentResult | null => {
    try {
      const parsed = JSON.parse(text) as { intent?: unknown; reply?: unknown };
      if (parsed.intent !== "conversation" && parsed.intent !== "redesign") return null;
      const reply =
        typeof parsed.reply === "string" && parsed.reply.trim()
          ? parsed.reply.trim().slice(0, 1600)
          : parsed.intent === "redesign"
            ? "I’ll apply that change to the selected target."
            : "I’m here. Ask me about the design or tell me what you’d like to explore.";
      return { mode: parsed.intent, reply, model };
    } catch {
      return null;
    }
  };

  const direct = parse(raw);
  if (direct) return direct;

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return parse(raw.slice(firstBrace, lastBrace + 1));
  }

  return null;
}

function quickConversationReply(message: string): string | null {
  const normalized = message.trim().toLowerCase().replace(/[!?.,]+$/g, "").trim();
  if (/^(hi|hello|hey|hiya|yo|hey there|hello there)$/.test(normalized)) {
    return "Hey! I’m Rezyn Chat. We can talk through the design, explore ideas, compare directions, or you can tell me exactly what you want changed and I’ll redesign it.";
  }
  if (/^(thanks|thank you|thankyou|thx|ty)$/.test(normalized)) {
    return "You’re welcome. We can keep discussing the design, or give me a specific change when you’re ready for me to edit the project.";
  }
  if (/^(how are you|how are you doing)$/.test(normalized)) {
    return "Doing well and ready to work on the project. We can just chat about the design first—nothing gets changed unless you clearly ask me to edit it.";
  }
  return null;
}

function looksLikeExplicitEdit(message: string) {
  return /\b(make|change|redesign|rebuild|rework|update|modify|replace|remove|delete|add|implement|create|convert|move|resize|reduce|increase|fix|apply|switch|restyle|reimagine|animate|align|center|hide|show|rewrite)\b/i.test(
    message,
  );
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGateway(messages: GatewayMessage[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");

  let lastError = "AI request failed";

  for (const model of CHAT_MODELS) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      try {
        const body: Record<string, unknown> = { model, messages };
        if (model.startsWith("openai/")) body["reasoning_effort"] = CHAT_REASONING_EFFORT;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (res.status === 402) throw new Error("AI credits exhausted.");

        if (!res.ok) {
          lastError =
            res.status === 429
              ? "Rate limit reached — retrying."
              : `AI request failed (${res.status})`;

          if (TRANSIENT_STATUS.has(res.status) && attempt === 0) {
            await sleep(700);
            continue;
          }

          if ([400, 404, 422, 429, 500, 502, 503, 504].includes(res.status)) break;
          throw new Error(lastError);
        }

        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content?.trim() ?? "";
        if (!content) throw new Error("AI returned an empty response");
        return { content, model };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          lastError = "AI request timed out";
          if (attempt === 0) {
            await sleep(500);
            continue;
          }
          break;
        }
        if (error instanceof Error && error.message === "AI credits exhausted.") throw error;
        lastError = error instanceof Error ? error.message : lastError;
        if (attempt === 0) {
          await sleep(500);
          continue;
        }
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  throw new Error(lastError);
}

async function classifyChatTurn(opts: {
  message: string;
  history: ChatTurn[];
  projectName: string;
  productType: string | null;
  activeStyle: string | null;
  fileName: string;
  manifest: string[];
}): Promise<IntentResult> {
  const quickReply = quickConversationReply(opts.message);
  if (quickReply) return { mode: "conversation", reply: quickReply, model: null };

  const systemPrompt =
    "You are the conversation router and conversational design copilot for Rezyn, a prompt-based UI/UX redesign studio. " +
    "Your most important rule: DO NOT edit files unless the user clearly asks for a project change to be implemented now. " +
    "Classify greetings, casual conversation, questions, explanations, brainstorming, critique, design discussion, asking for opinions or recommendations, comparing options, planning, hypothetical language, and ambiguous requests as conversation. " +
    "Examples of conversation: 'hello', 'what do you think of this design?', 'how could this be improved?', 'should we use glassmorphism?', 'explain the current layout', 'what would you recommend?', 'can we brainstorm the hero?'. " +
    "Classify as redesign only when the user clearly instructs Rezyn to change, add, remove, rebuild, restyle, fix, implement, or otherwise modify the selected project/files now. " +
    "Examples of redesign: 'make the hero cinematic', 'change the cards to glassmorphism', 'remove the sidebar', 'add a pricing section', 'redesign this from scratch'. " +
    "If intent is ambiguous, choose conversation and ask a concise clarifying question instead of editing. " +
    "For conversation, answer the user's message naturally and helpfully as a senior UI/UX and front-end design expert. You may discuss the project and selected style, but do not claim you changed anything. " +
    "For redesign, reply with a very short acknowledgement; the separate editing engine will perform the actual change. " +
    "Do not reveal chain-of-thought. Return ONLY valid JSON shaped exactly as {\"intent\":\"conversation\"|\"redesign\",\"reply\":\"...\"}.";

  const context =
    `Project: ${opts.projectName}\n` +
    `Product type: ${opts.productType ?? "Unknown"}\n` +
    `Selected direction: ${opts.activeStyle ?? "None"}\n` +
    `Current target file: ${opts.fileName}\n` +
    `Project files: ${opts.manifest.slice(0, 80).join(", ") || opts.fileName}`;

  try {
    const response = await callGateway([
      { role: "system", content: systemPrompt },
      { role: "system", content: context },
      ...opts.history.slice(-16).map((turn) => ({ role: turn.role, content: turn.content })),
      { role: "user", content: opts.message },
    ]);
    const parsed = parseIntentResult(response.content, response.model);
    if (parsed) return parsed;
  } catch {
    // A router failure must never accidentally trigger an edit for an ambiguous message.
  }

  if (looksLikeExplicitEdit(opts.message)) {
    return {
      mode: "redesign",
      reply: "I’ll apply that requested change to the selected target.",
      model: null,
    };
  }

  return {
    mode: "conversation",
    reply:
      "I’m with you. We can discuss the design, explore options, or brainstorm first. When you want me to actually modify the project, give me a clear edit instruction.",
    model: null,
  };
}

async function chatRedesignSource(opts: {
  fileName: string;
  currentContent: string;
  instruction: string;
  history: ChatTurn[];
  style?: string | null;
}): Promise<RedesignResult> {
  if (opts.currentContent.length > MAX_SOURCE_CHARS) {
    throw new Error("This file is too large for conversational redesign. Split it into smaller source files first.");
  }

  const designIntelligence = buildDesignIntelligenceContext({
    fileName: opts.fileName,
    source: opts.currentContent,
    style: opts.style ?? null,
    instruction: opts.instruction,
  });

  const systemPrompt =
    "You are Rezyn Chat, an elite product designer, UX architect, accessibility specialist, motion/visual designer, 2D/3D art director, and senior front-end engineer editing an existing product through conversation. " +
    "This function is reached only after a separate intent router has confirmed the user explicitly requested an edit. Apply that requested edit; do not reinterpret ordinary conversation here. " +
    "Work on the supplied CURRENT file, preserving every existing behavior that the user did not explicitly ask to change. " +
    "Keep routes, event handlers, state, data bindings, API calls, business logic, accessibility semantics, text meaning, and file format intact. " +
    "You may change presentation: layout markup, UI composition, classes, CSS, design tokens, typography, spacing, color, visual hierarchy, interaction states, responsive behavior, motion, rendering presentation, and accessibility improvements. " +
    "If the user asks for a redesign, new style, new look, rebuild, reimagine, or from-scratch treatment, treat the current presentation only as a functional specification and reconstruct its visual system rather than patching the old UI. " +
    "Honor previous edits already present in CURRENT content. Never silently revert them. Resolve an ambiguous visual detail with the safest reasonable interpretation. " +
    "Use the supplied Design Intelligence Operating System as mandatory expert guidance. Apply every relevant capability and never fabricate research findings, experiments, analytics, tool executions, eye-tracking, biometric results, A/B outcomes, or performance measurements. " +
    "Before answering, internally verify that the rewritten file is complete, important functional identifiers remain intact, and the result passes the relevant accessibility, responsive, state, hierarchy, motion, performance, visual-system, and 2D/3D quality gates. Fix defects before output. " +
    "Do not reveal private chain-of-thought. " +
    'Return ONLY one JSON object shaped exactly as {"reply":"...","file":"..."}. ' +
    '"reply" is a concise user-facing summary of the applied change (maximum 35 words). ' +
    '"file" is the COMPLETE rewritten source file, correctly JSON escaped. No markdown fences and no text outside the JSON object.';

  const baseMessages: GatewayMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "system", content: designIntelligence },
    ...opts.history.map((turn) => ({ role: turn.role, content: turn.content })),
    {
      role: "user",
      content:
        `File name: ${opts.fileName}\n\n` +
        `CURRENT file content:\n${opts.currentContent}\n\n` +
        `Confirmed edit instruction:\n${opts.instruction}`,
    },
  ];

  let lastValidationError = "AI did not return a valid rewritten file";

  for (let structuredAttempt = 0; structuredAttempt < 2; structuredAttempt += 1) {
    const messages =
      structuredAttempt === 0
        ? baseMessages
        : [
            ...baseMessages,
            {
              role: "system" as const,
              content:
                "Your previous output could not be validated. Regenerate the complete file, rerun the Design Intelligence quality review, fix every identified issue internally, and obey the JSON-only response contract exactly. Do not shorten or summarize the file.",
            },
          ];

    const response = await callGateway(messages);
    const parsed = parseStructuredResult(response.content, opts.fileName, opts.currentContent, opts.style);
    if (parsed) return { ...parsed, model: response.model };
    lastValidationError = "AI response failed source validation";
  }

  throw new Error(lastValidationError);
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        projectId: z.string().uuid(),
        fileId: z.string().uuid(),
        message: z.string().trim().min(1).max(4000),
        skipIntent: z.boolean().optional().default(false),
        recordUserMessage: z.boolean().optional().default(true),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("name, product_type, target_style, style_mode")
      .eq("id", data.projectId)
      .maybeSingle();
    if (projectError) throw new Error(projectError.message);
    if (!project) throw new Error("Project not found");

    const { data: unlocked, error: unlockError } = await supabase.rpc("unlock_project", { _project_id: data.projectId });
    if (unlockError) throw new Error(unlockError.message);
    if (!unlocked) throw new Error("NO_CREDITS: You need a website credit to redesign this project. Buy a pack on the Pricing page.");

    const { data: projectFiles, error: filesError } = await supabase
      .from("project_files")
      .select("id, name, content, redesigned_content, storage_path, status, target_style")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: true });
    if (filesError) throw new Error(filesError.message);

    const file = (projectFiles ?? []).find((entry) => entry.id === data.fileId);
    if (!file) throw new Error("File not found");

    const activeStyle =
      (project.style_mode === "file" ? file.target_style : project.target_style) ??
      file.target_style ??
      project.target_style ??
      null;

    const { data: projectHistoryRows, error: projectHistoryError } = await supabase
      .from("redesign_chats")
      .select("role, content, file_name, created_at")
      .eq("project_id", data.projectId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .limit(20);
    if (projectHistoryError) throw new Error(projectHistoryError.message);

    const projectHistory: ChatTurn[] = (projectHistoryRows ?? [])
      .slice()
      .reverse()
      .map((row) => ({
        role: row.role === "assistant" ? "assistant" : "user",
        content: row.content,
      }));

    let intent: IntentResult = {
      mode: "redesign",
      reply: "I’ll apply that requested change.",
      model: null,
    };

    if (!data.skipIntent) {
      intent = await classifyChatTurn({
        message: data.message,
        history: projectHistory,
        projectName: project.name,
        productType: project.product_type,
        activeStyle,
        fileName: file.name,
        manifest: (projectFiles ?? []).map((entry) => entry.name),
      });
    }

    if (intent.mode === "conversation") {
      if (data.recordUserMessage) {
        const { error: userMsgError } = await supabase.from("redesign_chats").insert({
          project_id: data.projectId,
          user_id: userId,
          role: "user",
          content: data.message,
          file_name: null,
        });
        if (userMsgError) throw new Error(userMsgError.message);
      }

      const { error: replyErr } = await supabase.from("redesign_chats").insert({
        project_id: data.projectId,
        user_id: userId,
        role: "assistant",
        content: intent.reply,
        file_name: null,
      });
      if (replyErr) throw new Error(replyErr.message);

      return {
        mode: "conversation" as const,
        reply: intent.reply,
        fileName: null,
        model: intent.model,
      };
    }

    const emitStatus = async (content: string) => {
      const { error } = await supabase.from("redesign_chats").insert({
        project_id: data.projectId,
        user_id: userId,
        role: "status",
        content,
        file_name: file.name,
      });
      if (error) console.warn("Could not persist Rezyn Chat status", error.message);
    };

    const { data: history, error: historyError } = await supabase
      .from("redesign_chats")
      .select("role, content, file_name, created_at")
      .eq("project_id", data.projectId)
      .eq("file_name", file.name)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .limit(16);
    if (historyError) throw new Error(historyError.message);

    const chatHistory: ChatTurn[] = (history ?? [])
      .slice()
      .reverse()
      .map((row) => ({
        role: row.role === "assistant" ? "assistant" : "user",
        content: row.content,
      }));

    if (data.recordUserMessage) {
      const { error: userMsgError } = await supabase.from("redesign_chats").insert({
        project_id: data.projectId,
        user_id: userId,
        role: "user",
        content: data.message,
        file_name: file.name,
      });
      if (userMsgError) {
        throw new Error(
          `Could not save your message (${userMsgError.message}) — has the redesign_chats migration been applied?`,
        );
      }
    }

    try {
      await emitStatus("Confirmed an edit request. Reading the latest source and previous edits.");

      let currentContent = file.redesigned_content ?? file.content ?? "";
      if (!currentContent && file.storage_path) {
        if (!isTextFile(file.name)) throw new Error("Not a text-based file");
        const dl = await supabase.storage.from("project-files").download(file.storage_path);
        if (dl.error) throw new Error(dl.error.message);
        currentContent = await dl.data.text();
      }
      if (!currentContent.trim()) throw new Error("File is empty");

      const { error: startErr } = await supabase
        .from("project_files")
        .update({ status: "redesigning", redesign_error: null })
        .eq("id", file.id);
      if (startErr) throw new Error(startErr.message);

      await emitStatus("Understanding the requested change and protecting existing behavior.");
      await emitStatus("Applying the full UI/UX and 2D/3D design intelligence framework.");
      await emitStatus("Designing and applying the requested interface change.");

      const { reply, file: updatedFile, model } = await chatRedesignSource({
        fileName: file.name,
        currentContent,
        instruction: data.message,
        history: chatHistory,
        style: activeStyle,
      });

      await emitStatus("Auditing accessibility, responsiveness, component states, motion and visual quality.");
      await emitStatus("Validating the complete rewritten file before saving.");

      const { error: doneErr } = await supabase
        .from("project_files")
        .update({ status: "done", redesigned_content: updatedFile, redesign_error: null })
        .eq("id", file.id);
      if (doneErr) throw new Error(doneErr.message);

      const { error: replyErr } = await supabase.from("redesign_chats").insert({
        project_id: data.projectId,
        user_id: userId,
        role: "assistant",
        content: reply,
        file_name: file.name,
      });
      if (replyErr) throw new Error(replyErr.message);

      await emitStatus("Saved the updated file. Ready to chat or make another change.");

      return {
        mode: "redesign" as const,
        reply,
        fileName: file.name,
        model,
      };
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "That edit failed";
      await supabase
        .from("project_files")
        .update({ status: "failed", redesign_error: messageText })
        .eq("id", file.id);
      await emitStatus(`Stopped: ${messageText}`);
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