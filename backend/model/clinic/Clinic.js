const mongoose = require("mongoose");
const { Schema } = mongoose;

const clinicSchema = new Schema({
  longitude: { type: String },
  latitude: { type: String },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: [{ type: String }],
  description: { type: String },
  logo_url: { type: String},
  banner_url: { type: String },
  tax_code: { type: String, required: true },
  registration_number: { type: String, required: true },
  opening_hours: { type: String },
  closing_hours: { type: String },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "AdminClinic" },
  specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
});

const Clinic = mongoose.model("Clinic", clinicSchema, "clinics");

module.exports = Clinic;
