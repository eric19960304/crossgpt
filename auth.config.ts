import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// This file must stay Edge-compatible (no Node.js-only imports like mongoose).
// Database callbacks live in auth.ts instead.

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/login";

      // Redirect root to /chat or /login
      if (nextUrl.pathname === "/") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/chat", nextUrl));
        }
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Logged-in users visiting /login get redirected to /chat
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/chat", nextUrl));
      }

      // Allow /login for unauthenticated users
      if (isLoginPage) {
        return true;
      }

      // Everything else requires authentication
      if (!isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
