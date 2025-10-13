const mongoose = require("mongoose");
const { Schema } = mongoose;

const specialtySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon_url: { type: String },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", required: true },
});

const Specialty = mongoose.model("Specialty", specialtySchema, "specialties");

module.exports = Specialty;
