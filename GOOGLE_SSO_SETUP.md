# Google SSO Setup Guide

This guide explains how to set up Google Single Sign-On (SSO) authentication for your CrossGPT application.

## Overview

The application now uses NextAuth.js v5 (Auth.js) with Google OAuth provider to authenticate users. All main routes (`/chat`, `/settings`, `/new-chat`, `/sd`, `/artifacts`) are protected and require authentication.

## Setup Instructions

### 1. Install Dependencies

Run the following command to install the required packages:

```bash
npm install
# or
yarn install
```

### 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-domain.com/api/auth/callback/google`
       - Example: `https://chat.ericlauchiho.me/api/auth/callback/google`
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory (or update your existing environment variables):

```bash
# Google OAuth Credentials (Required)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth Secret (Required)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# NextAuth URL (Required for production)
NEXTAUTH_URL=https://chat.ericlauchiho.me

# Your existing API keys...
OPENAI_API_KEY=sk-xxxx
GOOGLE_API_KEY=your-gemini-api-key
# ... etc
```

**Important Notes:**

- **NEXTAUTH_SECRET**: Generate a secure random string using `openssl rand -base64 32`
- **NEXTAUTH_URL**:
  - For local development, you can omit this (defaults to `http://localhost:3000`)
  - For production, set this to your deployed domain URL
- Make sure to add these to your Raspberry Pi environment variables

### 4. Update Docker Compose (For Production Deployment)

Update your `docker-compose.yml` to include the new environment variables:

```yaml
environment:
  - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
  - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
  - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
  - NEXTAUTH_URL=${NEXTAUTH_URL}
  # ... your existing env vars
```

Or set these environment variables directly on your Raspberry Pi 4B.

### 5. Build and Deploy

```bash
# Pull latest code
git -C /home/eric/projects/crossgpt pull

# Build and start the container
docker compose -f /home/eric/projects/crossgpt/docker-compose.yml up -d --build
```

## Accessing User Information

### Server-Side (Server Components & API Routes)

In Server Components or API routes, use the `auth()` function:

```typescript
import { auth } from "@/auth";

export default async function MyPage() {
  const session = await auth();

  if (!session || !session.user) {
    // User is not authenticated
    return <div>Please sign in</div>;
  }

  // Access user information
  const { id, email, name, image } = session.user;

  return (
    <div>
      <h1>Welcome, {name}!</h1>
      <p>Email: {email}</p>
      <p>User ID: {id}</p>
    </div>
  );
}
```

### Client-Side (Client Components)

In Client Components, use the `useSession()` hook:

```typescript
"use client";

import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !session.user) {
    return <div>Not authenticated</div>;
  }

  // Access user information
  const { id, email, name, image } = session.user;

  return (
    <div>
      <h1>Welcome, {name}!</h1>
      <p>Email: {email}</p>
      <img src={image} alt={name} />
    </div>
  );
}
```

### API Route Example

You can also call the `/api/user` endpoint to get user information:

```typescript
// GET /api/user
const response = await fetch("/api/user");
const data = await response.json();

if (response.ok) {
  const { id, email, name, image } = data.user;
  console.log("User:", { id, email, name, image });
} else {
  console.log("Not authenticated");
}
```

Response format:

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

### Protecting API Routes

To protect your API routes with authentication:

```typescript
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // User is authenticated, proceed with your logic
  const userId = session.user.id;
  const userEmail = session.user.email;

  // Your API logic here...
  return NextResponse.json({ message: "Success", userId });
}
```

## User Information Available

The following user information is available in the session:

- **id**: Google user ID (unique identifier)
- **email**: User's email address
- **name**: User's full name
- **image**: URL to user's Google profile picture

## Sign Out Functionality

Users can sign out using the sign-out button in the sidebar. You can also implement custom sign-out functionality:

```typescript
"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })}>Sign Out</button>
  );
}
```

## Flow Overview

1. **Unauthenticated User**:

   - Visits any route → Redirected to `/login`
   - Clicks "Sign in with Google" → Google OAuth flow
   - After successful authentication → Redirected to `/chat`

2. **Authenticated User**:

   - Can access all protected routes: `/chat`, `/settings`, `/new-chat`, `/sd`, `/artifacts`
   - Session persists for 30 days
   - User info displayed in sidebar
   - Can sign out using the logout button

3. **Session Management**:
   - Sessions are stored as JWT tokens (no database required)
   - Tokens are encrypted and signed with `NEXTAUTH_SECRET`
   - Sessions automatically refresh before expiration

## Troubleshooting

### "Configuration error" or "Invalid OAuth state"

- Make sure `NEXTAUTH_SECRET` is set and is a long, random string
- Verify `NEXTAUTH_URL` matches your deployed domain exactly
- Check that the redirect URI in Google Console matches your domain

### "Access denied" from Google

- Verify the authorized redirect URI is correctly configured in Google Console
- Make sure Google+ API is enabled for your project
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### Users are not redirected after login

- Check that `NEXTAUTH_URL` is set correctly in production
- Verify middleware configuration in `middleware.ts`

### Session not persisting

- Make sure `NEXTAUTH_SECRET` remains constant (don't regenerate it)
- Check browser cookies are enabled
- Verify the domain in `NEXTAUTH_URL` is correct

## Security Considerations

1. **Never commit** `.env.local` or any file containing secrets to version control
2. Use **strong, random values** for `NEXTAUTH_SECRET`
3. Keep your **Google Client Secret** secure
4. Regularly **rotate credentials** if compromised
5. Use **HTTPS in production** (NextAuth requires HTTPS for OAuth)
6. The Raspberry Pi environment variables should be set securely (not in code)

## Next Steps for User Data Storage

Currently, user information is only available in the session and not stored in a database. To persist user data:

1. **Choose a database**: PostgreSQL, MySQL, MongoDB, etc.
2. **Add database adapter**: NextAuth supports various adapters
3. **Store user records**: Save user profiles, preferences, chat history, etc.
4. **Update auth configuration**: Configure the adapter in `auth.config.ts`

Example database adapters:

- Prisma (PostgreSQL, MySQL, SQLite)
- MongoDB
- Supabase
- DynamoDB

Let me know when you're ready to implement user data persistence, and I can help with that implementation.
