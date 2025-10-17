const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    full_name: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
    avatar_url: { type: String },
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    // Settings
    notify_upcoming: { type: Boolean, default: true },
    notify_results: { type: Boolean, default: true },
    notify_marketing: { type: Boolean, default: false },
    privacy_allow_doctor_view: { type: Boolean, default: true },
    privacy_share_with_providers: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;