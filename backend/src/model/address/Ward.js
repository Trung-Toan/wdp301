const mongoose = require("mongoose");
const { Schema } = mongoose;

const wardSchema = new Schema({
    code: {
        type: String,
        required: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        index: true
    },
    shortName: {
        type: String,
        index: true
    },
    type: {
        type: String,
        enum: ["Phường", "Xã", "Thị trấn"],
        required: true
    },
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

wardSchema.index({ code: 1 });
wardSchema.index({ fullName: 1 });
wardSchema.index({ provinceCode: 1 });
wardSchema.index({ districtCode: 1 });
wardSchema.index({ provinceCode: 1, districtCode: 1 });

const Ward = mongoose.model("Ward", wardSchema);

module.exports = Ward;

