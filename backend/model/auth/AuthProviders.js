const mongoose = require("mongoose");
const { Schema } = mongoose;

const authProviderSchema = new Schema({
  provider: { type: String },
  provider_user_id: { type: String },
  email: { type: String },
  access_token_enc: { type: String },
  refresh_token_enc: { type: String },
  expires_at: { type: Date },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
});

const AuthProviders = mongoose.model(
  "AuthProviders",
  authProviderSchema,
  "auth_providers"
);

module.exports = AuthProviders;
