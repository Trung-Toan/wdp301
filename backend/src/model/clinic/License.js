const mongoose = require("mongoose");
const { Schema } = mongoose;

const licenseSchema = new Schema(
  {
    licenseNumber: { type: String, required: true },
    issued_by: { type: String, required: true },
    issued_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    document_url: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "EXPIRED"],
      default: "PENDING",
      required: true,
    },
    approved_at: { type: Date },
    rejected_reason: { type: String },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "AdminClinic" },
  },
  { timestamps: true }
);

const License = mongoose.model("License", licenseSchema, "licenses");

module.exports = License;
