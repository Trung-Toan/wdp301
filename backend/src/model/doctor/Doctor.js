const mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    title: { type: String },
    degree: { type: String },
    avatar_url: { type: String },
    workplace: { type: String },
    rating: { type: Number },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    specialty_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specialty",
        required: true,
      },
    ],
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String },
    experience: { type: String },
  },
  { timestamps: true }
);

doctorSchema.index({ clinic_id: 1 });
doctorSchema.index({ specialty_id: 1 });
doctorSchema.index({ user_id: 1 });
doctorSchema.index({ rating: -1 });

const Doctor = mongoose.model("Doctor", doctorSchema, "doctors");

module.exports = Doctor;
