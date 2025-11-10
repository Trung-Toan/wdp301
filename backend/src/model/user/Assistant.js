const mongoose = require("mongoose");
const { Schema } = mongoose;

const assistantSchema = new Schema(
  {
    note: { type: String },
    type: {
      type: [String],
      enum: ["NURSE", "RECEPTIONIST"],
      default: ["NURSE"],
      required: true,
    },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Ít nhất 1 role
assistantSchema.path("type").validate(
  (v) => Array.isArray(v) && v.length > 0,
  "type must contain at least one role"
);

// Khử trùng role
assistantSchema.pre("save", function (next) {
  if (Array.isArray(this.type)) {
    this.type = [...new Set(this.type)];
  }
  next();
});

const Assistant = mongoose.model("Assistant", assistantSchema, "assistants");

module.exports = Assistant;
