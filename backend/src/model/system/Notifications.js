const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["APPOINTMENT", "REMINDER", "CANCELLATION", "CONFIRMATION", "SYSTEM", "REVIEW"],
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  recipient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Account",
    required: true,
    index: true
  },
  recipient_type: { 
    type: String, 
    enum: ["PATIENT", "DOCTOR", "ASSISTANT", "ADMIN_CLINIC", "OWNER"],
    required: true 
  },
  related_appointment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Appointment" 
  },
  related_clinic: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Clinic" 
  },
  related_doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Doctor" 
  },
  is_read: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  read_at: { 
    type: Date 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Account" 
  },
  metadata: {
    type: Schema.Types.Mixed 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
notificationSchema.index({ recipient_id: 1, createdAt: -1 });
notificationSchema.index({ recipient_id: 1, is_read: 1 });

const Notification = mongoose.model("Notification", notificationSchema, "notifications");

module.exports = Notification;
