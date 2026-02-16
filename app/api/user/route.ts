import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/user
 * Returns the current authenticated user's session data
 *
 * Response format:
 * {
 *   user: {
 *     id: string,
 *     email: string,
 *     name: string,
 *     image: string
 *   }
 * }
 *
 * Returns 401 if not authenticated
 */
export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });
}
