import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { LLMModelDoc } from "@/app/models/LLMModel";
import { ADMIN_EMAIL } from "@/app/admin/config";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  await connectToDatabase();

  const updated = await LLMModelDoc.findByIdAndUpdate(
    params.id,
    { $set: body },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectToDatabase();
  const deleted = await LLMModelDoc.findByIdAndDelete(params.id).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
