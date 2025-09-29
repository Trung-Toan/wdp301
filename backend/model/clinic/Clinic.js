const mongoose = require("mongoose");
const { Schema } = mongoose;

const clinicSchema = new Schema({
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  status: { type: String, enum: [], required: true },
  longitude: { type: String },
  latitude: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "AdminClinic" },
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
});

const Clinic = mongoose.model("Clinic", clinicSchema, "clinics");

module.exports = Clinic;
