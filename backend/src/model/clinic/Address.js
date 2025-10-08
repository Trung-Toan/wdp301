const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new Schema({
  province: { type: String, required: true },
  ward: [{type: String, required: true}],
});

const Address = mongoose.model("Address", addressSchema, "address");

module.exports = Address;
