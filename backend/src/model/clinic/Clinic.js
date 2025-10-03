const mongoose = require("mongoose");
const { Schema } = mongoose;

const clinicSchema = new Schema({
  longitude: { type: String },
  latitude: { type: String },
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  facebook: { type: String },
  instagram: { type: String },
  youtube: { type: String },
  tiktok: { type: String },
  description: { type: String },
  logo_url: { type: String },
  banner_url: { type: String },
  tax_code: { type: String },
  registration_number: { type: String },
  opening_hours: { type: String },
  closing_hours: { type: String },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "AdminClinic" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
});

const Clinic = mongoose.model("Clinic", clinicSchema, "clinics");

module.exports = Clinic;
