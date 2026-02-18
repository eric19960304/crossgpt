import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Middleware runs in Edge runtime — use the lightweight authConfig (no mongoose).
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public|icons).*)"],
};
