export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiProviderName = "ollama" | "nvidia";

export type AiRequestOptions = {
  timeoutMs?: number;
  temperature?: number;
  json?: boolean;
  task?: string;
};

export type AiResponse = {
  content: string;
  model: string;
  provider: AiProviderName;
};

const TRANSIENT_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "qwen3-coder:30b";
const DEFAULT_NVIDIA_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODEL = "poolside/laguna-xs-2.1";

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function providerPreference(): "auto" | AiProviderName {
  const raw = (env("REZYN_AI_PROVIDER") ?? env("AI_PROVIDER") ?? "auto").toLowerCase();
  if (raw === "ollama" || raw === "nvidia") return raw;
  return "auto";
}

function providerOrder(): AiProviderName[] {
  const preference = providerPreference();
  if (preference === "ollama") return ["ollama"];
  if (preference === "nvidia") return ["nvidia"];
  return env("NVIDIA_API_KEY") ? ["nvidia", "ollama"] : ["ollama"];
}

function trimSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  label: string,
  input: string,
  init: RequestInit,
  timeoutMs: number,
) {
  let lastError = `${label} request failed`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      if (response.ok) return response;

      let detail = "";
      try {
        detail = (await response.text()).trim().slice(0, 500);
      } catch {
        // Keep the status-only message.
      }
      lastError = `${label} request failed (${response.status})${detail ? `: ${detail}` : ""}`;
      if (TRANSIENT_STATUS.has(response.status) && attempt === 0) {
        await sleep(500);
        continue;
      }
      throw new Error(lastError);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        lastError = `${label} request timed out after ${Math.round(timeoutMs / 1000)}s`;
      } else if (error instanceof Error) {
        lastError = error.message;
      }
      if (attempt === 0) {
        await sleep(350);
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(lastError);
}

async function callOllama(messages: AiMessage[], options: AiRequestOptions): Promise<AiResponse> {
  const baseUrl = trimSlash(env("OLLAMA_BASE_URL") ?? DEFAULT_OLLAMA_URL);
  const models = [
    env("OLLAMA_MODEL") ?? DEFAULT_OLLAMA_MODEL,
    env("OLLAMA_FALLBACK_MODEL"),
  ].filter((model, index, list): model is string => Boolean(model) && list.indexOf(model) === index);

  let lastError =
    "Ollama is unavailable. Start Ollama and run: ollama pull " + models[0];

  for (const model of models) {
    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        stream: false,
        options: {
          num_ctx: parsePositiveInt(env("OLLAMA_NUM_CTX"), 65536),
          temperature: options.temperature ?? 0.2,
        },
      };
      if (options.json) body["format"] = "json";

      const response = await fetchWithRetry(
        `Ollama (${model})`,
        `${baseUrl}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        options.timeoutMs ?? 240_000,
      );

      const json = (await response.json()) as {
        message?: { content?: string };
        error?: string;
      };
      if (json.error) throw new Error(`Ollama (${model}): ${json.error}`);
      const content = json.message?.content?.trim() ?? "";
      if (!content) throw new Error(`Ollama (${model}) returned an empty response`);
      return { content, model, provider: "ollama" };
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }

  throw new Error(lastError);
}

async function callNvidia(messages: AiMessage[], options: AiRequestOptions): Promise<AiResponse> {
  const apiKey = env("NVIDIA_API_KEY");
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not configured");

  const baseUrl = trimSlash(env("NVIDIA_BASE_URL") ?? DEFAULT_NVIDIA_URL);
  const model = env("NVIDIA_MODEL") ?? DEFAULT_NVIDIA_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    stream: false,
  };
  if (options.json) {
    body["response_format"] = { type: "json_object" };
  }

  const response = await fetchWithRetry(
    `NVIDIA NIM (${model})`,
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    options.timeoutMs ?? 180_000,
  );

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };
  if (json.error?.message) throw new Error(`NVIDIA NIM: ${json.error.message}`);
  const content = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) throw new Error(`NVIDIA NIM (${model}) returned an empty response`);
  return { content, model, provider: "nvidia" };
}

export async function generateAiText(
  messages: AiMessage[],
  options: AiRequestOptions = {},
): Promise<AiResponse> {
  const errors: string[] = [];

  for (const provider of providerOrder()) {
    try {
      return provider === "nvidia"
        ? await callNvidia(messages, options)
        : await callOllama(messages, options);
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(
    [
      "Rezyn AI is not available.",
      ...errors,
      "Local setup: install Ollama, run \"ollama pull qwen3-coder:30b\", then start Ollama.",
      "Optional cloud setup: set NVIDIA_API_KEY and REZYN_AI_PROVIDER=nvidia.",
    ].join(" "),
  );
}

export function getAiRuntimeSummary() {
  const preference = providerPreference();
  return {
    preference,
    ollama: {
      baseUrl: env("OLLAMA_BASE_URL") ?? DEFAULT_OLLAMA_URL,
      model: env("OLLAMA_MODEL") ?? DEFAULT_OLLAMA_MODEL,
      fallbackModel: env("OLLAMA_FALLBACK_MODEL") ?? null,
    },
    nvidia: {
      configured: Boolean(env("NVIDIA_API_KEY")),
      baseUrl: env("NVIDIA_BASE_URL") ?? DEFAULT_NVIDIA_URL,
      model: env("NVIDIA_MODEL") ?? DEFAULT_NVIDIA_MODEL,
    },
  };
}
