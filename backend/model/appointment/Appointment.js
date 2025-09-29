const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  reason: String,
  status: String,
  slot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Slot" },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
  specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty" },
});

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema,
  "appointments"
);

module.exports = Appointment;
