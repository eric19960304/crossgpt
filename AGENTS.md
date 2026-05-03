# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Rules

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Project Overview

CrossGPT is a full-stack LLM chatbot aggregator forked from [NextChat](https://github.com/ChatGPTNextWeb/NextChat). It combines multiple LLM APIs (OpenAI, Google Gemini, XAI/Grok) into one platform with Google SSO authentication. Deployed on a personal Raspberry Pi 4B via Docker Compose.

## Commands

```bash
# Development
yarn               # Install dependencies
yarn dev           # Start dev server on localhost:3000

# Build & Production
yarn build         # Standalone production build (BUILD_MODE=standalone)
yarn start         # Start production server

# Code Quality
yarn lint          # Run ESLint
```

Instruction to agents: After every code modification, please run `yarn build` to ensure the changes don't have compilation error. Don't run other command like yarn dev or yarn start which is likely requires DB and other dependencies that may not be presented in the terminal environment.

## Environment Variables

Required in `.env.local` for local development:

```bash
OPENAI_API_KEY=
GOOGLE_API_KEY=
XAI_API_KEY=
GOOGLE_CLIENT_ID=        # Google OAuth client ID
GOOGLE_CLIENT_SECRET=    # Google OAuth client secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=         # Generate with: openssl rand -base64 32
DEFAULT_MODEL=           # Deprecated — default model is now set via the admin UI (DB-backed)
```

Google OAuth redirect URI must be set to `https://localhost:3000/api/auth/callback/google` in Google Cloud Console for local dev.

## Architecture

## Models Constant

All the avaliable models are defined at [app/constant.ts](/app/constant.ts), for example:
```ts
const openaiModels = [
  "gpt-5-mini",
  "gpt-5.4",
  "gpt-5.5",
];

const googleModels: string[] = [
  "gemini-3-pro-preview"
];

const xAIModes = [
  "grok-4-0709",
  "grok-fast-reasoning",
  "grok-code-fast-1",
];
```

When adding/removing models, the app needs to modify this file and re-deploy. Note that the model list served to clients is DB-backed (see [Model Management](#model-management) below); `DEFAULT_MODELS` in `constant.ts` is only used as a seed source on first run.

**Next.js 14 App Router** with MongoDB (Mongoose) for user tracking and NextAuth.js v5 for auth.

### Key Directories

- [app/api/](app/api/) — API routes; dynamic provider routing via `app/api/[provider]/[...path]/route.ts` plus individual provider modules (`openai.ts`, `google.ts`, `xai.ts`, etc.)
- [app/client/](app/client/) — Client-side API wrappers and chat controller; platform integrations under `app/client/platforms/`
- [app/components/](app/components/) — React UI components (40+); main chat UI in `home.tsx` and `chat.tsx`
- [app/store/](app/store/) — Zustand stores: `chat.ts`, `config.ts`, `access.ts`, `plugin.ts`, `sync.ts`
- [app/models/](app/models/) — Mongoose models: `User.ts` (email, name, image, creditUSD), `Activity.ts` (login tracking), `LLMModel.ts` (DB-managed model list with costPerMillion), `GlobalConfig.ts` (singleton config: `initialUserCredit`, `defaultModel`), `OperationHistory.ts` (admin operation log)
- [app/lib/mongodb.ts](app/lib/mongodb.ts) — MongoDB connection singleton

### Authentication Flow

NextAuth.js v5 with Google OAuth only. JWT sessions (30-day expiry).

- [auth.config.ts](auth.config.ts) — Edge-compatible config (no DB imports); used in middleware
- [auth.ts](auth.ts) — Full auth with JWT/session callbacks; records logins to MongoDB
- [middleware.ts](middleware.ts) — Protects all routes except `/login` and `/api/auth/*`

Server-side: `import { auth } from "@/auth"; const session = await auth();`
Client-side: `import { useSession } from "next-auth/react";`

### Model Management

The available model list and the default model are both DB-backed and configurable from the admin UI without redeploying.

**Model list** — stored in the `LLMModel` collection. Seeded from `DEFAULT_MODELS` in `app/constant.ts` on first run (when the collection is empty). Admins can add, toggle, and delete models from the **Models** tab in `/admin`.

**Default model** — stored as `defaultModel` in the singleton `GlobalConfig` document (fallback: `"gpt-4o-mini"`). Admins set it via the **Default Model** input at the top of the Models tab. The env var `DEFAULT_MODEL` is superseded by the DB value and should be considered deprecated.

**Data flow:**
- `/api/models` (Node.js, authenticated) — returns `{ models: LLMModel[], defaultModel: string }`. The DB `defaultModel` is fetched here alongside the model list.
- `app/store/access.ts` `fetch()` — calls `/api/config` (edge, env vars) and `/api/models` (Node.js, DB) concurrently. The DB `defaultModel` from `/api/models` wins over the env-var one from `/api/config`. Both are resolved before setting `DEFAULT_CONFIG.modelConfig.model`.
- `/api/admin/models` — admin CRUD (GET list, POST create).
- `/api/admin/models/[id]` — admin CRUD (PATCH toggle/costs/vision, DELETE).
- `/api/admin/config` — admin GET/PATCH for `GlobalConfig` fields (`initialUserCredit`, `defaultModel`).

**Key files:**
- [app/models/GlobalConfig.ts](app/models/GlobalConfig.ts) — singleton schema; exports `FALLBACK_DEFAULT_MODEL` and `FALLBACK_INITIAL_USER_CREDIT`
- [app/models/LLMModel.ts](app/models/LLMModel.ts) — Mongoose schema for DB-managed models
- [app/api/models/route.ts](app/api/models/route.ts) — public (session-gated) GET; auto-seeds; returns `{ models, defaultModel }`
- [app/api/admin/models/route.ts](app/api/admin/models/route.ts) — admin CRUD (GET list, POST create)
- [app/api/admin/models/[id]/route.ts](app/api/admin/models/[id]/route.ts) — admin CRUD (PATCH toggle, DELETE)
- [app/api/admin/config/route.ts](app/api/admin/config/route.ts) — admin GET/PATCH for GlobalConfig
- [app/store/access.ts](app/store/access.ts) — `dbModels` field; `fetch()` concurrently calls `/api/config` + `/api/models`
- [app/utils/hooks.ts](app/utils/hooks.ts) — `useAllModels()` uses `dbModels` when available

### Credit System

Each user has a `creditUSD` balance (Number, default 0, rounded to 2 decimal places) stored in the `User` collection. Each model has a `costPerMillion` field (Number, default 0) in the `LLMModel` collection representing USD cost per 1 million tokens.

**Token usage extraction** — after every successful LLM API call the client-side platform classes (OpenAI, XAI, Google) call `options.onUsage({ promptTokens, completionTokens, totalTokens })`:
- OpenAI / XAI: `stream_options: { include_usage: true }` is added to streaming requests; usage is read from the final SSE chunk (`json.usage`) or from `resJson.usage` in non-streaming responses.
- Google: usage is read from `chunkJson.usageMetadata` in streaming chunks or `resJson.usageMetadata` in non-streaming responses.

**Deduction flow** — `onUserInput` in [app/store/chat.ts](app/store/chat.ts) passes an `onUsage` handler that POSTs to `/api/credits/deduct` with `{ modelName, providerName, totalTokens }`. That route looks up the model's `costPerMillion`, computes `cost = totalTokens × costPerMillion / 1_000_000`, and applies `$inc: { creditUSD: -cost }` on the user document.

**Key files:**
- [app/models/User.ts](app/models/User.ts) — `creditUSD` field
- [app/models/LLMModel.ts](app/models/LLMModel.ts) — `costPerMillion` field
- [app/client/api.ts](app/client/api.ts) — `LLMUsageTokens` interface; `onUsage?` in `ChatOptions`
- [app/api/credits/deduct/route.ts](app/api/credits/deduct/route.ts) — authenticated POST; deducts credit after a chat call
- [app/api/admin/credits/route.ts](app/api/admin/credits/route.ts) — admin-only POST; grants credit to a user by email
- [app/api/user/credit/route.ts](app/api/user/credit/route.ts) — authenticated GET; returns current user's `creditUSD`
- [app/components/user-profile.tsx](app/components/user-profile.tsx) — fetches `/api/user/credit` on mount and displays the balance in the sidebar

**Admin UI** — the `/admin` page has a **Credits** tab (grant credit by email + amount), a **Models** tab (set default model, add/toggle/delete models, inline-edit cost and vision fields), and an **Operations** tab (view history of admin actions). The operations tab no longer has any runnable actions — it is a read-only history log.

### Image Input (Vision)

Vision (image input) support is controlled per-model via the `visionCapable` boolean field in `LLMModel` (DB) and the `LLMModel` TypeScript interface in [app/client/api.ts](app/client/api.ts).

- `isVisionModel(modelName)` in [app/utils.ts](app/utils.ts) determines whether the upload button is shown in chat. It checks in order:
  1. `dbModels` from the access store — if the model is found, its `visionCapable` flag is used directly.
  2. `VISION_MODELS` env var (comma-separated model names).
  3. Hardcoded `VISION_MODEL_REGEXES` in [app/constant.ts](app/constant.ts) (e.g. `/gpt/`, `/gemini-2\.5/`).
- The admin **Models** tab has a **Vision** toggle column to set `visionCapable` per model without redeploying.

### Image Output (Generation)

Image generation is **only supported via DALL-E 3** (OpenAI). No other provider (Gemini, XAI, etc.) produces image output.

- `isDalle3(modelName)` in [app/utils.ts](app/utils.ts) detects DALL-E 3 models.
- [app/client/platforms/openai.ts](app/client/platforms/openai.ts) routes DALL-E 3 requests to `/images/generations` instead of `/chat/completions`, then extracts the returned image URL/base64 into a `MultimodalContent` array.
- The result is rendered as an `<img>` tag in [app/components/chat.tsx](app/components/chat.tsx).
- Gemini and other models do **not** generate image output. If they appear to respond with a tool-call JSON (`action`/`thought`/`action_input`), it is raw text — the app does not parse ReAct-style action blocks; only native `tool_calls` (OpenAI format) and `functionCall` (Gemini format) are handled.

### TypeScript Path Alias

`@/*` maps to the project root (configured in [tsconfig.json](tsconfig.json)).

### Styling

SCSS/Sass. Component-level styles use CSS Modules (`.module.scss`). Global styles in [app/styles/](app/styles/).

## Deployment

Production is deployed via Docker Compose on a Raspberry Pi 4B:

```bash
git -C /home/eric/projects/crossgpt pull
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml up -d --build
```

The [docker-compose.yml](docker-compose.yml) starts two services: the Next.js app and a MongoDB instance. API keys are stored as environment variables on the host machine.
