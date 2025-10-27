const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    full_name: { type: String, },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
    avatar_url: { type: String },
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    // Settings
    notify_upcoming: { type: Boolean, },
    notify_results: { type: Boolean, },
    notify_marketing: { type: Boolean, default: false },
    privacy_allow_doctor_view: { type: Boolean, },
    privacy_share_with_providers: { type: Boolean, },
  },
  { timestamps: true }
);

userSchema.virtual("patients", {
  ref: "Patient",         // tên model Patient
  localField: "_id",      // _id của User
  foreignField: "user_id", // user_id trong Patient
  justOne: true,          // mỗi user chỉ có 1 patient
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema, "users");

module.exports = User;