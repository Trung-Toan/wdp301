const mongoose = require("mongoose");
const { Schema } = mongoose;

const clinicSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    description: { type: String },
    logo_url: { type: String },
    banner_url: { type: String },

    // tax_code removed
    registration_number: { type: String, required: true },

    opening_hours: { type: String, required: true },
    closing_hours: { type: String, required: true },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "INACTIVE", "REJECTED"],
      default: "PENDING",
      required: true,
    },

    // Thông tin phê duyệt/từ chối (chỉ khi cần thiết)
    review_info: {
      reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminSystem",
      },
      reviewed_at: { type: Date },
      review_notes: { type: String },
      rejection_reason: { type: String },
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminClinic",
      required: true,
    },

    // Tham chiếu chi tiết địa chỉ (nếu bạn có collection AddressDetail)
    address_detail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddressDetail",
      required: false,
    },

    // Địa chỉ đơn giản hóa
    address: {
      province: {
        code: { type: String, required: true },
        name: { type: String, required: true },
      },
      ward: {
        code: { type: String, required: true },
        name: { type: String, required: true },
      },
      houseNumber: { type: String },
      street: { type: String },
      alley: { type: String },
      fullAddress: { type: String },
    },

    specialties: [{
      type: Schema.Types.ObjectId,
      ref: "Specialty",
      index: true,
    }],
  }, { timestamps: true }
);

// ==== Indexes ====
clinicSchema.index({ "address.province.code": 1, "address.ward.code": 1 });
clinicSchema.index({ name: 1 });
clinicSchema.index({ status: 1 });
clinicSchema.index({ specialties: 1 });
clinicSchema.index({ created_by: 1 });

// ==== Middleware tự động sinh fullAddress ====
clinicSchema.pre("save", function (next) {
  if (this.specialties?.length) {
    const set = new Set(this.specialties.map(id => id.toString()));
    this.specialties = [...set];
  }
  next();
});

clinicSchema.pre("save", function (next) {
  if (this.address) {
    const parts = [];

    if (this.address.houseNumber) parts.push(this.address.houseNumber);
    if (this.address.street) parts.push(this.address.street);
    if (this.address.alley) parts.push(this.address.alley);
    if (this.address.ward?.name) parts.push(this.address.ward.name);
    if (this.address.province?.name) parts.push(this.address.province.name);

    this.address.fullAddress = parts.join(", ");
  }
  next();
});

const Clinic = mongoose.model("Clinic", clinicSchema, "clinics");

module.exports = Clinic;
