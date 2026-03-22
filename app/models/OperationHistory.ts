import { Schema, model, models } from "mongoose";

const OperationHistorySchema = new Schema({
  operationName: { type: String, required: true },
  performedAt: { type: Date, default: Date.now },
  status: { type: String, required: true, enum: ["successful", "failed"] },
});

export const OperationHistory =
  models.OperationHistory ||
  model("OperationHistory", OperationHistorySchema, "operationhistories");
