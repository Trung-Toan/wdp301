const mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    title: { type: String },
    degree: { type: String },
    workplace: { type: String },
    rating: { type: Number },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    specialty_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Specialty", required: true }],
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema, "doctors");

module.exports = Doctor;