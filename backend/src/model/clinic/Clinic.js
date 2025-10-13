const mongoose = require("mongoose");
const { Schema } = mongoose;

const clinicSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  facebook: { type: String },
  instagram: { type: String },
  youtube: { type: String },
  tiktok: { type: String },
  description: { type: String },
  logo_url: { type: String },
  banner_url: { type: String },
  tax_code: { type: String, required: true },//bo
  registration_number: { type: String, required: true },
  opening_hours: { type: String, required: true },
  closing_hours: { type: String, required: true },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "AdminClinic", required: true },

  address_detail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AddressDetail",
    required: true
  },

  address: {
    province: {
      code: { type: String, required: true },
      name: { type: String, required: true }
    },
    ward: {
      code: { type: String, required: true },
      name: { type: String, required: true }
    },
    houseNumber: { type: String },
    street: { type: String },
    alley: { type: String },
    fullAddress: { type: String }
  }
}, { timestamps: true });

// Index cho tìm kiếm địa chỉ
clinicSchema.index({ "address.province.code": 1, "address.ward.code": 1 });
clinicSchema.index({ name: 1 });
clinicSchema.index({ status: 1 });

// Middleware tự động tạo fullAddress
clinicSchema.pre('save', function (next) {
  if (this.address) {
    const parts = [];

    if (this.address.houseNumber) parts.push(this.address.houseNumber);
    if (this.address.street) parts.push(this.address.street);
    if (this.address.alley) parts.push(this.address.alley);

    if (this.address.ward && this.address.ward.name) parts.push(this.address.ward.name);
    if (this.address.province && this.address.province.name) parts.push(this.address.province.name);

    this.address.fullAddress = parts.join(", ");
  }
  next();
});

const Clinic = mongoose.model("Clinic", clinicSchema, "clinics");

module.exports = Clinic;