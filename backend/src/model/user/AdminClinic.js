const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminClinicSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const AdminClinic = mongoose.model( "AdminClinic", AdminClinicSchema, "admin_clinics" );

module.exports = AdminClinic;
