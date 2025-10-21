const mongoose = require("mongoose");
const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    patient_code: { type: String, unique: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Location preference for proximity filtering
    province_code: { type: String, index: true },
    ward_code: { type: String, index: true },
    blood_type: { type: String },
    allergies: [String],
    chronic_diseases: [String],
    medications: [String],
    surgery_history: [String],
  },
  { timestamps: true }
);

//  Middleware: Tự động sinh mã bệnh nhân 8 số không trùng lặp
patientSchema.pre("save", async function (next) {
  if (this.patient_code) return next();

  let unique = false;
  let randomCode;

  while (!unique) {
    randomCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    const existing = await this.constructor.findOne({ patient_code: randomCode });
    if (!existing) unique = true;
  }

  this.patient_code = randomCode;
  console.log(" Sinh mã bệnh nhân:", this.patient_code);
  next();
});

// Fix lỗi model load trùng
const Patient =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema, "patients");

module.exports = Patient;
