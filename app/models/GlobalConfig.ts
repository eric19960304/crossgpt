import { Schema, model, models } from "mongoose";

export const FALLBACK_INITIAL_USER_CREDIT = 1.0;
export const FALLBACK_DEFAULT_MODEL = "gpt-5-mini";

const GlobalConfigSchema = new Schema({
  // Singleton discriminator — always "global". Used as the upsert filter.
  key: { type: String, required: true, unique: true, default: "global" },

  // Credit (USD) granted to new users on their first sign-in
  initialUserCredit: { type: Number, default: FALLBACK_INITIAL_USER_CREDIT },

  // Default model shown in every new chat window
  defaultModel: { type: String, default: FALLBACK_DEFAULT_MODEL },
});

export const GlobalConfig =
  models.GlobalConfig || model("GlobalConfig", GlobalConfigSchema, "globalconfig");
