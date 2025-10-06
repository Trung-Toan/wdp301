const mongoose = require("mongoose");
const { Schema } = mongoose;

const emailVerificationSchema = new Schema(
  {
    token_hash: { type: String, required: true }, // chỉ lưu hash
    expires_at: { type: Date, required: true, index: true, expires: 0 },
    used: { type: Boolean, default: false, index: true },
    account_id: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  },
  { timestamps: true, collection: "email_verifications" }
);

emailVerificationSchema.index({ account_id: 1, used: 1 });

module.exports = mongoose.model("EmailVerification", emailVerificationSchema);
