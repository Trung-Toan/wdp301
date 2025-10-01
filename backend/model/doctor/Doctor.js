const mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    title: { type: String, required: true },
    degree: { type: String, required: true },
    workplace: { type: String, required: true },
    rating: { type: Number, default: 0 },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema, "doctors");

module.exports = Doctor;
