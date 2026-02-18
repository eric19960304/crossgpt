import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Checks for a valid NextAuth SSO session.
 * Returns a 401 response if not authenticated, or null if authenticated.
 *
 * Usage in API route handlers:
 *   const denied = await requireSession();
 *   if (denied) return denied;
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: true, msg: "Unauthorized - please sign in" },
      { status: 401 },
    );
  }
  return null;
}
