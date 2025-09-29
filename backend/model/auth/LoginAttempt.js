const mongoose = require("mongoose");
const { Schema } = mongoose;

const loginAttemptSchema = new Schema({
  ip: { type: String },
  email: { type: String },
  ok: { type: Boolean },
  reason: { type: String },
  at: { type: Date },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
});

const LoginAttempt = mongoose.model(
  "LoginAttempt",
  loginAttemptSchema,
  "login_attempts"
);

module.exports = LoginAttempt;
