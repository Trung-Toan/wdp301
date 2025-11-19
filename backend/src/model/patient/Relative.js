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
    /**
     * Trạng thái hoạt động của người thân (Soft Delete Pattern)
     * 
     * - true: Người thân đang hoạt động, hiển thị trong danh sách
     * - false: Người thân đã bị xóa (soft delete), ẩn khỏi danh sách nhưng vẫn lưu trong DB
     * 
     * Mục đích:
     * 1. Bảo toàn dữ liệu: Giữ lại lịch sử appointments đã đặt cho người thân này
     * 2. Có thể khôi phục: Có thể set lại is_active = true nếu cần
     * 3. Audit trail: Giữ lại thông tin để kiểm tra/audit sau này
     * 
     * Lưu ý khi query:
     * - Luôn filter is_active: true khi lấy danh sách người thân
     * - Kiểm tra is_active khi đặt lịch cho người thân
     * - Khi xóa: Set is_active = false thay vì xóa record
     * 
     * @example
     * // Lấy danh sách người thân active
     * Relative.find({ user_id: userId, is_active: true })
     * 
     * // Soft delete
     * relative.is_active = false;
     * await relative.save();
     */
    is_active: { type: Boolean, default: true },
    notes: { type: String } // Ghi chú thêm về người thân
  },
  { timestamps: true }
);

/**
 * Index để tối ưu query performance
 * - user_id: Tìm kiếm người thân theo user
 * - is_active: Filter chỉ lấy người thân đang active
 * 
 * Query pattern thường dùng:
 * Relative.find({ user_id: userId, is_active: true })
 */
relativeSchema.index({ user_id: 1, is_active: 1 });

// Fix lỗi model load trùng
const Relative =
  mongoose.models.Relative || mongoose.model("Relative", relativeSchema, "relatives");

module.exports = Relative;

