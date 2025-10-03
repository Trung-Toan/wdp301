const mongoose = require("mongoose");
const { Schema } = mongoose;

const licenseSchema = new Schema(
  {
    licenseNumber: { type: String },
    issued_by: { type: String },
    issued_date: { type: Date },
    expiry_date: { type: Date },
    document_url: [{ type: String }],
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "EXPIRED"], default: "PENDING", required: true },
    approved_at: { type: Date },
    rejected_reason: { type: String },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "AdminClinic" },
  },
  { timestamps: true }
);

const License = mongoose.model("License", licenseSchema, "licenses");

module.exports = License;
