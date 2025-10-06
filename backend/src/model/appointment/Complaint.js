const mongoose = require("mongoose");
const { Schema } = mongoose;

const complaintSchema = new Schema({
  content: { type: String },
  evidence: { type: String },
  status: { type: String, enum: ["PENDING", "RESOLVED", "DISMISSED"], default: "PENDING", required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
});

const Complaint = mongoose.model("Complaint", complaintSchema, "complaints");

module.exports = Complaint;
