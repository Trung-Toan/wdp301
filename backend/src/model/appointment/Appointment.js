const mongoose = require("mongoose");
const { Schema } = mongoose;

const slotSchema = new Schema({
  start_time: { type: Date },
  end_time: { type: Date },
  max_datients: { type: Number },
  status: { type: String, enum: ["AVAIABLE", "BOOKED", "CANCELLED"], required: true },
  note: { type: String },
}, { _id: false });

const appointmentSchema = new Schema({
  reason: String,
  status: { type: String, enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"], default: "SCHEDULED", required: true },
  slot: [slotSchema],
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
});

const Appointment = mongoose.model("Appointment", appointmentSchema, "appointments");

module.exports = Appointment;
