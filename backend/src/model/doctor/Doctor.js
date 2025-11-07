const mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    title: { type: String, trim: true },
    degree: { type: String, trim: true },         
    description: { type: String, trim: true },
    experience: { type: String, trim: true },      
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      index: true,
    },
    specialty_id: [
      {
        type: Schema.Types.ObjectId,
        ref: "Specialty",
        required: true,   
      },
    ],
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ✅ Bảo đảm mảng specialty_id có ít nhất 1 phần tử (khớp Yup .min(1))
doctorSchema.path("specialty_id").validate(function (v) {
  return Array.isArray(v) && v.length > 0;
}, "specialty_id must contain at least one specialty");

// ✅ Loại bỏ phần tử trùng trong mảng specialty_id (nếu lỡ gửi trùng)
doctorSchema.pre("save", function (next) {
  if (Array.isArray(this.specialty_id)) {
    const unique = [...new Set(this.specialty_id.map(String))];
    this.specialty_id = unique.map((id) => new mongoose.Types.ObjectId(id));
  }
  next();
});

doctorSchema.index({ clinic_id: 1 });
doctorSchema.index({ specialty_id: 1 });
doctorSchema.index({ user_id: 1 });

const Doctor = mongoose.model("Doctor", doctorSchema, "doctors");

module.exports = Doctor;
