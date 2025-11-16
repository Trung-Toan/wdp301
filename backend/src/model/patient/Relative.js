const mongoose = require("mongoose");
const { Schema } = mongoose;

const relativeSchema = new Schema(
  {
    user_id: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    dob: { type: Date },
    gender: { 
      type: String, 
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "MALE"
    },
    province_code: { type: String },
    ward_code: { type: String },
    address: { type: String },
    relationship: {
      type: String,
      enum: ["cha", "me", "con", "vo_chong", "anh_chi_em", "ban", "khac"],
      required: true
    },
    // Link với Patient record (nếu đã có)
    patient_id: { 
      type: Schema.Types.ObjectId, 
      ref: "Patient",
      default: null,
      index: true
    },
    is_active: { type: Boolean, default: true },
    notes: { type: String } // Ghi chú thêm về người thân
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
relativeSchema.index({ user_id: 1, is_active: 1 });

// Fix lỗi model load trùng
const Relative =
  mongoose.models.Relative || mongoose.model("Relative", relativeSchema, "relatives");

module.exports = Relative;

