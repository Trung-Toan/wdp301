const mongoose = require("mongoose");
const { Schema } = mongoose;

const wardSchema = new Schema({
    code: {
        type: String,
        required: true,
        index: true
    }, // "00004"
    fullName: {
        type: String,
        required: true,
        index: true
    }, // "Phường Ba Đình"
    shortName: {
        type: String,
        index: true
    }, // "Ba Đình"
    type: {
        type: String,
        enum: ["Phường", "Xã", "Thị trấn"],
        required: true
    }, // "Phường"
    provinceCode: {
        type: String,
        required: true,
        ref: "Province.code",
        index: true
    }
}, {
    timestamps: true,
    collection: "wards"
});

// Index cho tìm kiếm
wardSchema.index({ code: 1 });
wardSchema.index({ fullName: 1 });
wardSchema.index({ provinceCode: 1 });
wardSchema.index({ districtCode: 1 });
wardSchema.index({ provinceCode: 1, districtCode: 1 });

const Ward = mongoose.model("Ward", wardSchema);

module.exports = Ward;

