const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressDetailSchema = new Schema({
    // Tham chiếu đến đơn vị hành chính
    province: {
        code: { type: String, required: true },
        name: { type: String, required: true }
    },
    ward: {
        code: { type: String, required: true },
        name: { type: String, required: true }
    },

    // Chi tiết địa chỉ (user tự nhập)
    houseNumber: { type: String },
    street: { type: String },
    alley: { type: String },

    // Địa chỉ đầy đủ (tự động tạo)
    fullAddress: { type: String }
}, {
    timestamps: true,
    collection: "address_details"
});

// Index cho tìm kiếm
addressDetailSchema.index({ "province.code": 1, "ward.code": 1 });

// Middleware tự động tạo fullAddress
addressDetailSchema.pre('save', function (next) {
    const parts = [];

    if (this.houseNumber) parts.push(this.houseNumber);
    if (this.street) parts.push(this.street);
    if (this.alley) parts.push(this.alley);
    if (this.ward.name) parts.push(this.ward.name);
    if (this.province.name) parts.push(this.province.name);

    this.fullAddress = parts.join(", ");
    next();
});

const AddressDetail = mongoose.model("AddressDetail", addressDetailSchema);

module.exports = AddressDetail;

