const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  reason: String,
  status: { type: String, enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"], default: "SCHEDULED", required: true },
  slot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Slot" },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty" },
  clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
}, { timestamps: true });

const Appointment = mongoose.model("Appointment", appointmentSchema, "appointments");

module.exports = Appointment;
