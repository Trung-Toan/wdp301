const mongoose = require("mongoose");
const { Schema } = mongoose;

const assistantSchema = new Schema(
  {
    note: { type: String },
    status: { type: String, enum: [], required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Assistant = mongoose.model("Assistant", assistantSchema, "assistants");

module.exports = Assistant;
