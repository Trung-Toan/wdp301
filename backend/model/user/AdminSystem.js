const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminsystemSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const AdminSystem = mongoose.model(
  "AdminSystem",
  adminsystemSchema,
  "admin_systems"
);

module.exports = AdminSystem;
