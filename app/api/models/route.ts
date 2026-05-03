import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "../session-guard";
import { connectToDatabase } from "@/app/lib/mongodb";
import { LLMModelDoc } from "@/app/models/LLMModel";
import { DEFAULT_MODELS } from "@/app/constant";
import {
  GlobalConfig,
  FALLBACK_DEFAULT_MODEL,
} from "@/app/models/GlobalConfig";

async function handle(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;

  await connectToDatabase();

  const count = await LLMModelDoc.countDocuments();
  if (count === 0) {
    // Seed from DEFAULT_MODELS on first use
    const docs = DEFAULT_MODELS.map((m) => ({
      name: m.name,
      available: m.available,
      sorted: m.sorted,
      provider: {
        id: m.provider.id,
        providerName: m.provider.providerName,
        providerType: m.provider.providerType,
        sorted: m.provider.sorted,
      },
    }));
    await LLMModelDoc.insertMany(docs, { ordered: false });
  }

  const [models, configDoc] = await Promise.all([
    LLMModelDoc.find().sort({ sorted: 1 }).lean(),
    GlobalConfig.findOne({ key: "global" }).lean(),
  ]);
  const result = models.map((m: any) => {
    const costsMissing =
      (m.inputCostPerMillion ?? 0) <= 0 ||
      (m.outputCostPerMillion ?? 0) <= 0;
    return costsMissing ? { ...m, available: false } : m;
  });
  const defaultModel = (configDoc as any)?.defaultModel ?? FALLBACK_DEFAULT_MODEL;
  return NextResponse.json({ models: result, defaultModel });
}

export const GET = handle;
