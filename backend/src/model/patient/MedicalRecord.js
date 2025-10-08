const mongoose = require("mongoose");

const AccessRequestSchema = new mongoose.Schema(
  {
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    requested_at: { type: Date, default: Date.now },
    approved_at: { type: Date },
    date_expired: { type: Date },
  },
  { _id: false }
);

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    medicines: [MedicineSchema],
    instruction: { type: String },
    verified_at: { type: Date },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  },
  { _id: false }
);

const MedicalRecordSchema = new mongoose.Schema(
  {
    diagnosis: { type: String },
    symptoms: [{ type: String }],
    notes: { type: String },
    attachments: [{ type: String }],

    access_requests: [AccessRequestSchema],

    prescription: PrescriptionSchema,

    status: { type: String, enum: ["PUBLIC", "PRIVATE"], default: "PRIVATE", required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", MedicalRecordSchema, "medical_records");
