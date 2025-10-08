const mongoose = require("mongoose");
const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
    phone_number: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true, select: false },
    status: { type: String, default: "ACTIVE", enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "INREVIEW", "REJECTED", "PENDING"], required: true },
    role: { type: String, enum: ["ADMIN_SYSTEM", "ADMIN_CLINIC", "DOCTOR", "ASSISTANT", "PATIENT"], required: true, default: "PATIENT", },
    email_verified: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "accounts" }
);


module.exports = mongoose.model("Account", accountSchema);
