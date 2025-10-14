const mongoose = require("mongoose");
const { Schema } = mongoose;

const slotSchema = new Schema({
  doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  clinic_id: { type: Schema.Types.ObjectId, ref: "Clinic" },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  status: { type: String, enum: ["AVAILABLE", "UNAVAILABLE"], default: "AVAILABLE", required: true },
  max_patients: { type: Number, required: true, min: 1 },
  booked_count: { type: Number, default: 0 },
  note: { type: String },
  created_by: { type: Schema.Types.ObjectId, ref: "Assistant", required: true },
}, { timestamps: true });

slotSchema.index({ doctor_id: 1, start_time: 1 }, { unique: true });

const Slot = mongoose.model("Slot", slotSchema, "slots");

module.exports = Slot;