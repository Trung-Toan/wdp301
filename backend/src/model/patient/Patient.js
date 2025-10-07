const mongoose = require("mongoose");
const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    patient_code: { type: String, unique: true, required: true },
    blood_type: { type: String },
    allergies: [String],
    chronic_diseases: [String],
    medications: [String],
    surgery_history: [String],
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema, "patients");

module.exports = Patient;
