const mongoose = require("mongoose");
const { Schema } = mongoose;

const statusEnum = ["SCHEDULED", "COMPLETED", "APPROVE", "CANCELLED", "NO_SHOW"];

const appointmentSchema = new Schema({
  slot_id: { type: Schema.Types.ObjectId, ref: "Slot", required: true, index: true },
  doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  patient_id: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  specialty_id: { type: Schema.Types.ObjectId, ref: "Specialty", required: true, index: true },
  clinic_id: { type: Schema.Types.ObjectId, ref: "Clinic", index: true },


  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
  province_code: { type: String },
  ward_code: { type: String },
  address_text: { type: String },
  reason: { type: String },

<<<<<<< HEAD
  // Thông tin người thân (cho người già)
  relative_name: { type: String },
  relative_phone: { type: String },
  relative_relationship: { 
    type: String, 
    enum: ["con", "chau", "vo_chong", "anh_chi_em", "ban", "khac"],
    default: null
  },
  is_elderly: { type: Boolean, default: false },
  patient_age: { type: Number },

  // Trạng thái & ngày tháng
  status: { type: String, enum: statusEnum, default: "SCHEDULED" },
  booked_at: { type: Date, default: Date.now }, // ngày giờ đặt
  scheduled_date: { type: Date, required: true },     // ngày khám (từ slot)
=======
>>>>>>> dinh

  status: { type: String, enum: statusEnum, default: "SCHEDULED" },
  booked_at: { type: Date, default: Date.now },
  scheduled_date: { type: Date, required: true },

  fee_amount: { type: Number, required: true },

  booking_code: { type: String, index: true }
}, { timestamps: true });

function dateOnlyUTC(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}



appointmentSchema.index(
  { slot_id: 1, patient_id: 1, scheduled_date: 1 },
  { unique: true, partialFilterExpression: { status: "SCHEDULED" } }
);

module.exports = mongoose.model("Appointment", appointmentSchema, "appointments");
