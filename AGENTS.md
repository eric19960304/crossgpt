# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
DEFAULT_MODEL=           # e.g. gpt-4o-mini
```

Google OAuth redirect URI must be set to `https://localhost:3000/api/auth/callback/google` in Google Cloud Console for local dev.

## Architecture

## Models Constant

All the avaliable models are defined at [app/constant.ts](/app/constant.ts), for example:
```ts
const openaiModels = [
  "gpt-5-nano",
  "gpt-5-mini",
  "gpt-5",
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

When adding/removing models, the app need to modify this file and re-deploy.

**Next.js 14 App Router** with MongoDB (Mongoose) for user tracking and NextAuth.js v5 for auth.

### Key Directories

- [app/api/](app/api/) — API routes; dynamic provider routing via `app/api/[provider]/[...path]/route.ts` plus individual provider modules (`openai.ts`, `google.ts`, `xai.ts`, etc.)
- [app/client/](app/client/) — Client-side API wrappers and chat controller; platform integrations under `app/client/platforms/`
- [app/components/](app/components/) — React UI components (40+); main chat UI in `home.tsx` and `chat.tsx`
- [app/store/](app/store/) — Zustand stores: `chat.ts`, `config.ts`, `access.ts`, `plugin.ts`, `sync.ts`
- [app/models/](app/models/) — Mongoose models: `User.ts` (email, name, image, creditUSD), `Activity.ts` (login tracking), and `LLMModel.ts` (DB-managed model list with costPerMillion)
- [app/lib/mongodb.ts](app/lib/mongodb.ts) — MongoDB connection singleton

### Authentication Flow

NextAuth.js v5 with Google OAuth only. JWT sessions (30-day expiry).

- [auth.config.ts](auth.config.ts) — Edge-compatible config (no DB imports); used in middleware
- [auth.ts](auth.ts) — Full auth with JWT/session callbacks; records logins to MongoDB
- [middleware.ts](middleware.ts) — Protects all routes except `/login` and `/api/auth/*`

Server-side: `import { auth } from "@/auth"; const session = await auth();`
Client-side: `import { useSession } from "next-auth/react";`

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

**Admin UI** — the `/admin` page has a **Credits** tab (grant credit by email + amount) and the **Models** tab has an inline-editable "Cost / 1M tokens" column that PATCHes `/api/admin/models/[id]`.

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
