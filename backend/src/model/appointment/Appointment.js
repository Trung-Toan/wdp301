const mongoose = require("mongoose");
const { Schema } = mongoose;

const statusEnum = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];

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

// Tự động lấy ngày & giá từ slot
appointmentSchema.pre("validate", async function (next) {
  try {
    if (this.isModified("slot_id")) {
      const Slot = mongoose.model("Slot");
      const slot = await Slot.findById(this.slot_id).lean();
      if (!slot) return next(new Error("Invalid slot_id"));

      // Gán giá & ngày khám
      this.fee_amount = slot.fee_amount ?? 0;
      this.scheduled_date = dateOnlyUTC(new Date(slot.start_time));
    }

    next();
  } catch (err) {
    next(err);
  }
});

appointmentSchema.index(
  { slot_id: 1, patient_id: 1 },
  { unique: true, partialFilterExpression: { status: "SCHEDULED" } }
);

module.exports = mongoose.model("Appointment", appointmentSchema, "appointments");
