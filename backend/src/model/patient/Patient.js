const mongoose = require("mongoose");
const { Schema } = mongoose;

const patientSchema = new Schema({
  patient_code: { type: String, unique: true, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

  blood_type: { type: String },
  allergies: [String],
  chronic_diseases: [String],
  medications: [String],
  surgery_history: [String],
}, { timestamps: true });
// Middleware: Tự động sinh mã bệnh nhân 8 số không trùng lặp
patientSchema.pre("save", async function (next) {
  if (this.patient_code) return next();

  let unique = false;
  let randomCode;

  while (!unique) {
    // Sinh ngẫu nhiên 8 chữ số (10000000–99999999)
    randomCode = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Kiểm tra trùng trong DB
    const existing = await mongoose.models.Patient.findOne({ patient_code: randomCode });
    if (!existing) unique = true;
  }

  this.patient_code = randomCode;
  next();
});

const Patient = mongoose.model("Patient", patientSchema, "patients");
module.exports = Patient;
