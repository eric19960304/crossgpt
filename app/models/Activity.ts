import mongoose, { Schema, model, models } from "mongoose";

const ActivitySchema = new Schema({
  email: { type: String, required: true, index: true },
  event: { type: String, required: true, enum: ["login", "logout"] },
  timestamp: { type: Date, default: Date.now },
});

export const Activity =
  models.Activity || model("Activity", ActivitySchema, "activities");
