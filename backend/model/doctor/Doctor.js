const mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    title: { type: String },
    degree: { type: String },
    workplace: { type: String },
    status: { type: String },
    staff_number: { type: Number },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema, "doctors");

module.exports = Doctor;
