const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  rating: { type: Number },
  comment: { type: String },
  is_annonymous: { type: Boolean },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema, "feedbacks");

module.exports = Feedback;
