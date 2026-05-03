import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ADMIN_EMAIL } from "@/app/admin/config";
import { connectToDatabase } from "@/app/lib/mongodb";
import { OperationHistory } from "@/app/models/OperationHistory";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  await connectToDatabase();
  const history = await OperationHistory.find()
    .sort({ performedAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json(history);
}
