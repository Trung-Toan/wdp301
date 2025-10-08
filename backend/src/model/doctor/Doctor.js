const mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
<<<<<<< HEAD:backend/model/doctor/Doctor.js
    title: { type: String, required: true },
    degree: { type: String, required: true },
    workplace: { type: String, required: true },
    rating: { type: Number, default: 0 },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    specialty_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty", required: true },
=======
    title: { type: String },
    degree: { type: String },
    workplace: { type: String },
    rating: { type: Number },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    specialty_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Specialty" }],
>>>>>>> 29a14564fe27655d89a78025a7fa7933b7966dd2:backend/src/model/doctor/Doctor.js
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema, "doctors");

module.exports = Doctor;
