const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    citizenId: { type: String, required: true, unique: true },
    full_name: { type: String, required: true, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String },
    avatar_url: { type: String },
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
