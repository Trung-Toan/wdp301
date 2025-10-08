const mongoose = require("mongoose");
const { Schema } = mongoose;

const loginAttemptSchema = new Schema(
  {
    ip: { type: String },
    email: { type: String, lowercase: true, trim: true },
    ok: { type: Boolean },
    reason: { type: String },
    at: { type: Date, default: Date.now, index: true, expires: 60 * 60 * 24 * 30 },
    account_id: { type: Schema.Types.ObjectId, ref: "Account", index: true },
    user_agent: { type: String },
  },
  { timestamps: true, collection: "login_attempts" }
);

loginAttemptSchema.index({ email: 1, at: -1 });

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
