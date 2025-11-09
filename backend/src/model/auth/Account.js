const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs"); // <- THÊM DÒNG NÀY

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

// Hash trước khi lưu (chỉ khi password bị đổi)
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// So sánh plaintext với hash trong DB
accountSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model("Account", accountSchema);
