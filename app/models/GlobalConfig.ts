import { Schema, model, models } from "mongoose";

export const FALLBACK_INITIAL_USER_CREDIT = 1.0;

const GlobalConfigSchema = new Schema({
  // Singleton discriminator — always "global". Used as the upsert filter.
  key: { type: String, required: true, unique: true, default: "global" },

  // Credit (USD) granted to new users on their first sign-in
  initialUserCredit: { type: Number, default: FALLBACK_INITIAL_USER_CREDIT },

  // Future settings go here, e.g.:
  // maintenanceMode: { type: Boolean, default: false },
  // maxDailyRequestsPerUser: { type: Number, default: 100 },
});

export const GlobalConfig =
  models.GlobalConfig || model("GlobalConfig", GlobalConfigSchema, "globalconfig");
