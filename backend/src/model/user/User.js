const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    full_name: { type: String, },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
    avatar_url: { type: String },
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    // Settings
    notify_upcoming: { type: Boolean,  },
    notify_results: { type: Boolean,  },
    notify_marketing: { type: Boolean, default: false },
    privacy_allow_doctor_view: { type: Boolean,  },
    privacy_share_with_providers: { type: Boolean,  },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;