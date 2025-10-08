const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
    {
        account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },

        refresh_token_hash: { type: String, required: true },
        refresh_fingerprint: { type: String, required: true, index: true, unique: true },
        ip: { type: String },
        user_agent: { type: String },
        expires_at: { type: Date, required: true, index: true },
        revoked_at: { type: Date, index: true },
        revoked_reason: { type: String },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

sessionSchema.index({ account_id: 1, revoked_at: 1 });
sessionSchema.index({ expires_at: 1 });

module.exports = mongoose.model('Session', sessionSchema);
