const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
    formData: {},
    documents: [
        {
            fileUrl: String,
            fileHash: String,
            verified: Boolean
        }
    ],
    status: { type: String, enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'], default: 'SUBMITTED' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    analytics: {},
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Application', applicationSchema);
