## Background

This project is built on top of an open source project https://github.com/ChatGPTNextWeb/NextChat, where it combine several LLM chatbot api into one platform.

The modification I made to this project are as following:

- remove unwanted components, like Mask and NewChat screen, and Vercel deployment features created by the original authors to their partnership vendors, etc.
- change the UI look and feel.
- removed unwanted models, only keeping OpenAI, Gemini, and Grok.
- added Google SSO login

## Deployment Information

Currently the website is hosted at my personal Raspberry Pi 4B (running Raspberry Pi OS, a Debian GNU/Linux system).

The website is deployed using docker compose with configuration file located at [docker-compose.yml](/docker-compose.yml).
The bash script used at my Raspberry Pi 4B to deploy and execute the website is following:

```bash
git -C /home/eric/projects/crossgpt pull
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml up -d --build
```

All the API Key for accessing the LLM chatbot API are stored at the environment variables at the Raspberry Pi 4B.

# Deployment

## Requirements

See [Dockerfile](/Dockerfile) and [docker-compose.yml](/docker-compose.yml).

### Environment Variables

The following environment variables are required for local development and production deployment:

```bash
# for LLM models API access
OPENAI_API_KEY='your OpenAI API key'
GOOGLE_API_KEY='your Google API key'
XAI_API_KEY='your XAI API key'

# for Google SSO login
GOOGLE_CLIENT_ID='your Google SSO Client ID'
GOOGLE_CLIENT_SECRET='your Google SSO Client Secret'
NEXTAUTH_URL='your application URL, http://localhost:3000 for localhost dev'
NEXTAUTH_SECRET='a random secret you generated for security purpose, use openssl rand -base64 32'

# app setting
DEFAULT_MODEL='default model to use, e.g. gpt-5-nano'

# DB setting
CROSSGPT_DB_DATA_PATH='specifying data path at the host machine, only required when running via Docker Compose'
```

## Setup for Local Development

1. **Get Google OAuth Credentials**:
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `https://localhost:3000/api/auth/callback/google`
2. install nodejs and yarn first
3. config local env vars in `.env.local`
4. run following to start the app:
    ```bash
    yarn
    yarn dev
    ```

## Setup for Production

1. **Get Google OAuth Credentials**:
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `https://your_side_url/api/auth/callback/google`
2. config env vars in `~/.bash_profile` or `~/.bashrc` or other shell config files. 
3. build and Deploy on Serverside:
   ```bash
   git -C /home/eric/projects/crossgpt pull
   docker compose -f /home/eric/projects/crossgpt/docker-compose.yml up -d --build
   ```

## Auth Design

### Authentication Flow:

1. **Unauthenticated Access**:

   ```
   User visits any route → Middleware checks auth → Redirects to /login
   ```

2. **Login Process**:

   ```
   User clicks "Sign in with Google" → Google OAuth flow → User authorizes →
   Redirected back to app → Session created → Redirected to /chat
   ```

3. **Protected Routes**:
   - all routes except `/login` and `/api/auth/*`.

4. **Public Routes**:
   - `/login` - Login page
   - `/api/auth/*` - Authentication endpoints

### Session Management:

- **Storage**: JWT tokens (no database required)
- **Duration**: 30 days
- **Security**: Encrypted with `NEXTAUTH_SECRET`
- **Refresh**: Automatic before expiration

## Accessing User Information

### 1. Server-Side (Server Components & API Routes)

```typescript
import { auth } from "@/auth";

const session = await auth();
const user = session?.user; // { id, email, name, image }
```

### 2. Client-Side (Client Components)

```typescript
import { useSession } from "next-auth/react";

const { data: session } = useSession();
const user = session?.user; // { id, email, name, image }
```

### 3. API Endpoint

```bash
GET /api/user
```

Returns:

```json
{
  "user": {
    "id": "google-user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://lh3.googleusercontent.com/..."
  }
}
```

## User Data Available

The session provides these user properties:

| Property | Type   | Description                   | Example                                 |
| -------- | ------ | ----------------------------- | --------------------------------------- |
| id       | string | Google user ID (unique)       | "108123456789012345678"                 |
| email    | string | User's email address          | "user@example.com"                      |
| name     | string | User's full name              | "John Doe"                              |
| image    | string | URL to Google profile picture | "https://lh3.googleusercontent.com/..." |

## Notes

- The implementation uses **NextAuth.js v5** (latest version)
- **No database required** for basic authentication
- All routes except `/login` and `/api/auth/*` require authentication
- User sessions last **30 days** by default
- The user profile component is displayed in the **sidebar**
- Users can sign out using the **logout button** in the sidebar

## Google SSO Implementation Summary

### What Was Implemented

This app has integrated with Google Single Sign-On (SSO) authentication. Here's a complete overview:

### Files explained

1. **Authentication Configuration**
   - [auth.config.ts](/auth.config.ts) - NextAuth configuration with Google provider
   - [auth.ts](/auth.ts) - NextAuth initialization and exports
   - [middleware.ts](/middleware.ts) - Route protection middleware
   - [types/next-auth.d.ts](/types/next-auth.d.ts) - TypeScript type definitions for session

2. **Login Page**
   - [app/login/page.tsx](/app/login/page.tsx) - Login page component with Google sign-in button
   - [app/login/login.module.scss](/app/login/login.module.scss)` - Styling for login page
   - [app/icons/google.svg](/app/icons/google.svg) - Google logo icon
   - [app/icons/logout.svg](/app/icons/logout.svg) - Logout icon

3. **User Profile Component**
   - [app/components/user-profile.tsx`](/app/components/user-profile.tsx) - User profile display with sign-out button
   - [app/components/user-profile.module.scss`](/app/components/user-profile.module.scss) - User profile styling
   - [app/components/session-provider.tsx`](/app/components/session-provider.tsx) - NextAuth session provider wrapper

4. **API Routes**
   - [app/api/auth/[...nextauth]/route.ts`](/app/api/auth/[...nextauth]/route.ts) - NextAuth API handler
   - [app/api/user/route.ts`](/app/api/user/route.ts) - User session info endpoint