const mongoose = require("mongoose");
const { Schema } = mongoose;

const slotSchema = new Schema({
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  status: { type: String, enum: ["AVAIABLE", "UNAVAIABLE"], required: true },
  max_datients: { type: Number, required: true },
  note: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Assistant", required: true },
});

const Slot = mongoose.model("Slot", slotSchema, "slots");

module.exports = Slot;