# Rezyn — Standalone Local Setup

Rezyn no longer requires Lovable to run.

## Requirements

- Node.js 22+
- npm
- A Supabase project (existing Rezyn project can be reused)
- Ollama for completely free local AI, or an optional NVIDIA NIM API key

## 1. Clone and install

```bash
git clone https://github.com/arivuwallet-sketch/ux-bloom-works.git
cd ux-bloom-works
npm ci
```

## 2. Install Ollama

Install Ollama from https://ollama.com and make sure the Ollama service is running.

Pull the default Rezyn coding model:

```bash
npm run ai:pull
```

This pulls:

```text
qwen3-coder:30b
```

The model is configurable. If your machine needs a smaller model, change `OLLAMA_MODEL` in `.env.local`.

## 3. Configure environment

Copy the example file:

### PowerShell

```powershell
Copy-Item .env.example .env.local
```

### macOS/Linux

```bash
cp .env.example .env.local
```

Fill in the Supabase values and keep:

```env
REZYN_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3-coder:30b
OLLAMA_NUM_CTX=65536
```

No AI API key is required for Ollama.

### Optional NVIDIA NIM

If you want cloud inference instead of local inference:

```env
REZYN_AI_PROVIDER=nvidia
NVIDIA_API_KEY=your_server_side_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=poolside/laguna-xs-2.1
```

With `REZYN_AI_PROVIDER=auto`, Rezyn uses NVIDIA when a key is configured and otherwise falls back to Ollama.

## 4. Supabase auth

Rezyn uses Supabase directly for email/password and Google OAuth.

For Google sign-in during local development, add this redirect URL to the Supabase Auth URL configuration:

```text
http://localhost:3000/auth
```

Set the Site URL to your production URL when deploying elsewhere.

## 5. Start locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 6. Production build

```bash
npm run build
npm run start
```

The Node/Nitro server runs from:

```text
.output/server/index.mjs
```

## AI provider behavior

Rezyn's redesign engine, Rezyn Chat, SEO Agent, blog writer and artifact generators all use the shared `src/lib/ai-provider.ts`.

Provider order:

1. `REZYN_AI_PROVIDER=nvidia` — NVIDIA NIM only.
2. `REZYN_AI_PROVIDER=ollama` — local Ollama only.
3. `REZYN_AI_PROVIDER=auto` — NVIDIA when `NVIDIA_API_KEY` exists, otherwise Ollama.

The default local model is `qwen3-coder:30b`. It is downloaded and served by Ollama on the user's machine.

## Database migrations

Use a normal PostgreSQL connection string:

```env
DATABASE_URL=postgresql://...
```

Then use Drizzle as usual.

## Cashfree

Cashfree remains optional and server-side:

```env
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
```

The existing Rezyn payment/credit bypass behavior is unchanged.
