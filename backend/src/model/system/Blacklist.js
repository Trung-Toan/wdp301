const mongoose = require("mongoose");
const { Schema } = mongoose;

const blacklistSchema = new Schema({
  reason: { type: String },
  evidence: { type: String },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Blacklist = mongoose.model("Blacklist", blacklistSchema, "blacklists");

module.exports = Blacklist;
