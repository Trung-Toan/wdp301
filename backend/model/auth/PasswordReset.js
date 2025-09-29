const mongoose = require("mongoose");
const { Schema } = mongoose;

const passwordResetSchema = new Schema({
  token_hash: { type: String },
  expires_at: { type: Date },
  used: { type: Boolean, default: false },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
});

const PasswordReset = mongoose.model(
  "PasswordReset",
  passwordResetSchema,
  "password_resets"
);

module.exports = PasswordReset;
