const mongoose = require("mongoose");
const { Schema } = mongoose;

const slotSchema = new Schema({
  start_time: { type: Date },
  end_time: { type: Date },
  status: { type: String, enum: ["AVAIABLE", "BOOKED", "CANCELLED"], required: true },
  max_datients: { type: Number },
  note: { type: String },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Assistant" },
});

const Slot = mongoose.model("Slot", slotSchema, "slots");

module.exports = Slot;
