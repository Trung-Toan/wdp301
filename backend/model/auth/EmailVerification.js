const mongoose = require("mongoose");
const { Schema } = mongoose;

const emailVerificationSchema = new Schema({
  token_hash: { type: String },
  expires_at: { type: Date },
  used: { type: Boolean, default: false },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
});

const EmailVerification = mongoose.model(
  "EmailVerification",
  emailVerificationSchema,
  "email_verifications"
);

module.exports = EmailVerification;
