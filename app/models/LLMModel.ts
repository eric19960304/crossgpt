import { Schema, model, models } from "mongoose";

const LLMModelProviderSchema = new Schema(
  {
    id: { type: String, required: true },
    providerName: { type: String, required: true },
    providerType: { type: String, required: true },
    sorted: { type: Number, default: 1 },
  },
  { _id: false },
);

const LLMModelSchema = new Schema({
  name: { type: String, required: true },
  available: { type: Boolean, default: true },
  sorted: { type: Number, default: 0 },
  inputCostPerMillion: { type: Number, default: 0 },
  outputCostPerMillion: { type: Number, default: 0 },
  provider: { type: LLMModelProviderSchema, required: true },
});

LLMModelSchema.index({ name: 1, "provider.id": 1 }, { unique: true });

export const LLMModelDoc =
  models.LLMModel || model("LLMModel", LLMModelSchema, "llmmodels");
