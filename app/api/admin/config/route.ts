import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import {
  GlobalConfig,
  FALLBACK_INITIAL_USER_CREDIT,
} from "@/app/models/GlobalConfig";
import { ADMIN_EMAIL } from "@/app/admin/config";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectToDatabase();

  const config = (await GlobalConfig.findOne({ key: "global" }).lean()) as any;

  return NextResponse.json({
    initialUserCredit:
      config?.initialUserCredit ?? FALLBACK_INITIAL_USER_CREDIT,
  });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();

  if (
    body.initialUserCredit !== undefined &&
    (typeof body.initialUserCredit !== "number" || body.initialUserCredit < 0)
  ) {
    return NextResponse.json(
      { error: "initialUserCredit must be a non-negative number" },
      { status: 400 },
    );
  }

  // Build $set from whitelist only — never let the client write arbitrary fields
  const $set: Record<string, unknown> = {};
  if (typeof body.initialUserCredit === "number") {
    $set.initialUserCredit = body.initialUserCredit;
  }

  if (Object.keys($set).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  await connectToDatabase();

  const updated = (await GlobalConfig.findOneAndUpdate(
    { key: "global" },
    { $set, $setOnInsert: { key: "global" } },
    { upsert: true, new: true },
  ).lean()) as any;

  return NextResponse.json({
    initialUserCredit:
      updated?.initialUserCredit ?? FALLBACK_INITIAL_USER_CREDIT,
  });
}
