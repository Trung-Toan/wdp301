const mongoose = require("mongoose");
const { Schema } = mongoose;

const specialtySchema = new Schema({
  name: { type: String },
  description: { type: String },
  icon_url: { type: String },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
});

const Specialty = mongoose.model("Specialty", specialtySchema, "specialties");

module.exports = Specialty;
