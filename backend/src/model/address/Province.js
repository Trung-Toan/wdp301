const mongoose = require("mongoose");
const { Schema } = mongoose;

const provinceSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
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
        enum: ["Thành phố", "Tỉnh"],
        required: true
    }
}, {
    timestamps: true,
    collection: "provinces"
});

provinceSchema.index({ code: 1 });
provinceSchema.index({ fullName: 1 });
provinceSchema.index({ shortName: 1 });

const Province = mongoose.model("Province", provinceSchema);

module.exports = Province;






