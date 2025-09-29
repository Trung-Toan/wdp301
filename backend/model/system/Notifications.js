const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
  title: { type: String },
  type: { type: String },
  content: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
  "notifications"
);

module.exports = Notification;
