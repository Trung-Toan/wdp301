const mongoose = require("mongoose");
const { Schema } = mongoose;

const slotSchema = new Schema({
  start_time: { type: Date },
  end_time: { type: Date },
  status: { type: String, enum: ["AVAIABLE", "UNAVAIABLE"], required: true },
  max_datients: { type: Number },
  note: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Assistant" },
});

const Slot = mongoose.model("Slot", slotSchema, "slots");

module.exports = Slot;