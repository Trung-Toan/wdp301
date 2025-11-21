const mongoose = require("mongoose");
const { Schema } = mongoose;

const AbsenceSchema = new Schema(
    {
        doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        start_time: { type: Date, required: true },
        end_time: { type: Date, required: true },
        reason: { type: String, required: true },
        cancelled_appointments_count: { type: Number, default: 0 },
    },
    { timestamps: true }
);

AbsenceSchema.index({ doctor_id: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Absence", AbsenceSchema, "absences");