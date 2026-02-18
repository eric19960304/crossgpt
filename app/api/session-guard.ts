import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Edge-compatible session check using JWT (no database/mongoose needed).
 * Returns a 401 response if not authenticated, or null if authenticated.
 *
 * Usage in API route handlers:
 *   const denied = await requireSession(request);
 *   if (denied) return denied;
 */
export async function requireSession(req: NextRequest) {
  const isSecure = req.url.startsWith("https://");
  const cookieName = isSecure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName,
  });
  if (!token) {
    return NextResponse.json(
      { error: true, msg: "Unauthorized - please sign in" },
      { status: 401 },
    );
  }
  return null;
}
