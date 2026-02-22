import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { LLMModelDoc } from "@/app/models/LLMModel";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { modelName, providerName, promptTokens, completionTokens } = body;

  if (
    !modelName ||
    typeof promptTokens !== "number" ||
    typeof completionTokens !== "number" ||
    promptTokens < 0 ||
    completionTokens < 0
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (promptTokens === 0 && completionTokens === 0) {
    return NextResponse.json({ ok: true, deducted: 0 });
  }

  await connectToDatabase();

  // Find model cost by name and providerName (e.g. "OpenAI", "Google", "XAI")
  const model = await LLMModelDoc.findOne({
    name: modelName,
    "provider.providerName": providerName,
  }).lean() as any;

  if (
    !model ||
    ((!model.inputCostPerMillion || model.inputCostPerMillion <= 0) &&
      (!model.outputCostPerMillion || model.outputCostPerMillion <= 0))
  ) {
    // No cost configured — nothing to deduct
    return NextResponse.json({ ok: true, deducted: 0 });
  }

  const inputCost = model.inputCostPerMillion ?? 0;
  const outputCost = model.outputCostPerMillion ?? 0;

  const cost =
    Math.round(
      ((promptTokens * inputCost + completionTokens * outputCost) / 1_000_000) * 100,
    ) / 100;

  if (cost <= 0) {
    return NextResponse.json({ ok: true, deducted: 0 });
  }

  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    { $inc: { creditUSD: -cost } },
    { new: true },
  ).lean() as any;

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    deducted: cost,
    balance: Math.round((updated.creditUSD ?? 0) * 100) / 100,
  });
}
