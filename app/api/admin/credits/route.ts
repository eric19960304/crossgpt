import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { ADMIN_EMAIL } from "@/app/admin/config";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { email, amount } = body;

  if (!email || typeof amount !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectToDatabase();

  const updated = await User.findOneAndUpdate(
    { email },
    { $inc: { creditUSD: amount } },
    { new: true },
  ).lean() as any;

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const newBalance = Math.round((updated.creditUSD ?? 0) * 100) / 100;

  return NextResponse.json({ ok: true, email, balance: newBalance });
}
