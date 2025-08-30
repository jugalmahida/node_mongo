const mongoose = require('mongoose');

const auditTrailSchema = new mongoose.Schema({
    action: { type: String, required: true },
    refId: { type: mongoose.Schema.Types.ObjectId },
    entityType: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    meta: {}
});
module.exports = mongoose.model('AuditTrail', auditTrailSchema);
