const mongoose = require("mongoose");
const { Schema } = mongoose;

const statusEnum = ["SCHEDULED", "COMPLETED", "APPROVE", "CANCELLED", "NO_SHOW", "DOCTOR_CANCELLED"];

const appointmentSchema = new Schema({
  slot_id: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
  doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  patient_id: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  specialty_id: { type: Schema.Types.ObjectId, ref: "Specialty", required: true, index: true },
  clinic_id: { type: Schema.Types.ObjectId, ref: "Clinic", index: true },
  
  // Booking for: "self" (bản thân) hoặc "relative" (người thân)
  booking_for: { 
    type: String, 
    enum: ["self", "relative"], 
    default: "self",
    index: true
  },
  // ID người thân nếu booking_for === "relative"
  relative_id: { 
    type: Schema.Types.ObjectId, 
    ref: "Relative",
    default: null
  },
  // ID của user đặt lịch (người đặt lịch cho người thân)
  booked_by_user_id: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    default: null
  },

  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
  province_code: { type: String },
  ward_code: { type: String },
  address_text: { type: String },
  reason: { type: String },

  // Thông tin người thân (cho người già - one-time info, không lưu vào Relative)
  // Lưu ý: Nếu booking_for === "relative", dùng relative_id thay vì các fields này
  // Các fields này chỉ dùng khi is_elderly === true và booking_for === "self"
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
