const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String },
    password: { type: String, required: true },
    status: { type: String, default: "ACTIVE" },
    role: {
      type: String,
      enum: ["ADMIN_SYSTEM", "ADMIN_CLINIC", "DOCTOR", "ASSISTANT", "PATIENT"],
      required: true,
    },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema, "accounts");

module.exports = Account;
