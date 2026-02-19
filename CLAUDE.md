# CLAUDE.md

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

**Next.js 14 App Router** with MongoDB (Mongoose) for user tracking and NextAuth.js v5 for auth.

### Key Directories

- [app/api/](app/api/) — API routes; dynamic provider routing via `app/api/[provider]/[...path]/route.ts` plus individual provider modules (`openai.ts`, `google.ts`, `xai.ts`, etc.)
- [app/client/](app/client/) — Client-side API wrappers and chat controller; platform integrations under `app/client/platforms/`
- [app/components/](app/components/) — React UI components (40+); main chat UI in `home.tsx` and `chat.tsx`
- [app/store/](app/store/) — Zustand stores: `chat.ts`, `config.ts`, `access.ts`, `plugin.ts`, `sync.ts`
- [app/models/](app/models/) — Mongoose models: `User.ts` (email, name, image) and `Activity.ts` (login tracking)
- [app/lib/mongodb.ts](app/lib/mongodb.ts) — MongoDB connection singleton

### Authentication Flow

NextAuth.js v5 with Google OAuth only. JWT sessions (30-day expiry).

- [auth.config.ts](auth.config.ts) — Edge-compatible config (no DB imports); used in middleware
- [auth.ts](auth.ts) — Full auth with JWT/session callbacks; records logins to MongoDB
- [middleware.ts](middleware.ts) — Protects all routes except `/login` and `/api/auth/*`

Server-side: `import { auth } from "@/auth"; const session = await auth();`
Client-side: `import { useSession } from "next-auth/react";`

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
