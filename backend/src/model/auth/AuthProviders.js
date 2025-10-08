const mongoose = require("mongoose");
const { Schema } = mongoose;

const authProviderSchema = new Schema(
  {
    provider: { type: String, enum: ["google", "facebook", "apple"], required: true },
    provider_user_id: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    access_token_enc: { type: String },
    refresh_token_enc: { type: String },
    expires_at: { type: Date },
    account_id: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  },
  { timestamps: true, collection: "auth_providers" }
);

authProviderSchema.index({ provider: 1, provider_user_id: 1 }, { unique: true });

module.exports = mongoose.model("AuthProviders", authProviderSchema);
