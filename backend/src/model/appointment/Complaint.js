const mongoose = require("mongoose");
const { Schema } = mongoose;

const complaintSchema = new Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  evidence: [{ type: String }], // Array of file URLs/evidence
  complaint_type: { 
    type: String, 
    enum: ["DOCTOR", "CLINIC"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["PENDING", "IN_REVIEW", "RESOLVED", "DISMISSED"], 
    default: "PENDING", 
    required: true 
  },
  patient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patient", 
    required: true,
    index: true
  },
  doctor_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Doctor",
    index: true
  },
  clinic_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Clinic",
    index: true
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminSystem"
  },
  resolved_at: { type: Date },
  resolution_note: { type: String },
  dismissed_reason: { type: String },
}, { timestamps: true });

// Validation: phải có doctor_id hoặc clinic_id
complaintSchema.pre('save', function(next) {
  if (!this.doctor_id && !this.clinic_id) {
    return next(new Error('Phải có doctor_id hoặc clinic_id'));
  }
  // Đảm bảo chỉ có một trong hai: doctor_id hoặc clinic_id
  if (this.complaint_type === "DOCTOR" && !this.doctor_id) {
    return next(new Error('doctor_id là bắt buộc khi complaint_type = DOCTOR'));
  }
  if (this.complaint_type === "CLINIC" && !this.clinic_id) {
    return next(new Error('clinic_id là bắt buộc khi complaint_type = CLINIC'));
  }
  // Nếu có cả hai, chỉ giữ lại một cái tùy theo complaint_type
  if (this.complaint_type === "DOCTOR" && this.clinic_id) {
    this.clinic_id = undefined;
  }
  if (this.complaint_type === "CLINIC" && this.doctor_id) {
    this.doctor_id = undefined;
  }
  next();
});

const Complaint = mongoose.model("Complaint", complaintSchema, "complaints");

module.exports = Complaint;
