const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new Schema({
  province: { type: String },
  ward: [String],
});

const Address = mongoose.model("Address", addressSchema, "address");

module.exports = Address;
