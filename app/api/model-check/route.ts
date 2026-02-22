import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { LLMModelDoc } from "@/app/models/LLMModel";

export async function POST(req: NextRequest) {
  const { modelName, providerId } = await req.json();

  if (!modelName || !providerId) {
    return NextResponse.json({ available: true });
  }

  await connectToDatabase();

  const model = await LLMModelDoc.findOne({
    name: modelName,
    "provider.id": providerId,
  }).lean() as any;

  // Model not in DB — don't block unknown models
  if (!model) {
    return NextResponse.json({ available: true });
  }

  return NextResponse.json({ available: model.available !== false });
}
