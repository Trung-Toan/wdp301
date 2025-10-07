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
  },
  { timestamps: true }
);z

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
