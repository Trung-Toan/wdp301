const mongoose = require("mongoose");
const { Schema } = mongoose;

const statusEnum = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];

const appointmentSchema = new Schema({
  slot_id: { type: Schema.Types.ObjectId, ref: "Slot", required: true, index: true },
  doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  patient_id: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  specialty_id: { type: Schema.Types.ObjectId, ref: "Specialty", required: true, index: true },
  clinic_id: { type: Schema.Types.ObjectId, ref: "Clinic", index: true },
  //Thêm Enum ai đặtlịchh
  
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
  province_code: { type: String },
  ward_code: { type: String },
  address_text: { type: String },
  reason: { type: String },

  // Trạng thái & ngày tháng
  status: { type: String, enum: statusEnum, default: "SCHEDULED" },
  booked_at: { type: Date, default: Date.now }, // ngày giờ đặt
  scheduled_date: { type: Date, required: true },     // ngày khám (từ slot)

  // Giá khám tại thời điểm đặt
  fee_amount: { type: Number, required: true },

  // Mã đặt lịch để gửi email
  booking_code: { type: String, index: true }
}, { timestamps: true });

// Helper để lấy phần ngày (bỏ giờ)
function dateOnlyUTC(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Pre-validate hook đã được loại bỏ để tránh conflict với service logic
// Ngày và giá sẽ được set trực tiếp trong service

appointmentSchema.index(
  { slot_id: 1, patient_id: 1, scheduled_date: 1 },
  { unique: true, partialFilterExpression: { status: "SCHEDULED" } }
);

module.exports = mongoose.model("Appointment", appointmentSchema, "appointments");
