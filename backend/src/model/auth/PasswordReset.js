const mongoose = require("mongoose");
const { Schema } = mongoose;

const passwordResetSchema = new Schema(
  {
    token_hash: { type: String, required: true },
    expires_at: { type: Date, required: true, index: true, expires: 0 },
    used: { type: Boolean, default: false, index: true },
    account_id: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  },
  { timestamps: true, collection: "password_resets" }
);

passwordResetSchema.index({ account_id: 1, used: 1 });

module.exports = mongoose.model("PasswordReset", passwordResetSchema);
