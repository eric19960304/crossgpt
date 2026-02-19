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

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectToDatabase();
  const models = await LLMModelDoc.find().sort({ sorted: 1 }).lean();
  return NextResponse.json(models);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { name, provider } = body;

  if (!name || !provider?.id || !provider?.providerName || !provider?.providerType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectToDatabase();

  const maxDoc = await LLMModelDoc.findOne().sort({ sorted: -1 }).lean() as any;
  const nextSorted = maxDoc ? (maxDoc.sorted ?? 0) + 1 : 1000;

  const created = await LLMModelDoc.create({
    name,
    available: true,
    sorted: nextSorted,
    provider: {
      id: provider.id,
      providerName: provider.providerName,
      providerType: provider.providerType,
      sorted: provider.sorted ?? 1,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
