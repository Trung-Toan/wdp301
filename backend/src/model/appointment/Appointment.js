const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  reason: { type: String },
  status: { type: String, enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"], default: "SCHEDULED", required: true },
  slot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty", required: true },
  clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
  //add date
}, { timestamps: true });

const Appointment = mongoose.model("Appointment", appointmentSchema, "appointments");

module.exports = Appointment;
