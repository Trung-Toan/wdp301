const mongoose = require("mongoose");
const { Schema } = mongoose;

const slotSchema = new Schema({
  start_time: { type: Number, required: true },
  end_time: { type: Number, required: true },
  status: { type: String, enum: ["AVAIABLE", "UNAVAIABLE"], default: "AVAIABLE", required: true },
  max_datients: { type: Number, required: true },
  note: { type: String },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Assistant", required: true },
});

const Slot = mongoose.model("Slot", slotSchema, "slots");

module.exports = Slot;