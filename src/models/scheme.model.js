const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['OPEN', 'CLOSED', 'ARCHIVED'], default: 'OPEN' },
    fundAllocation: {
        totalAmount: Number,
        availableAmount: Number,
        disbursedAmount: Number
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    analytics: {
        applicants: { type: Number, default: 0 },
        claimsApproved: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Scheme', schemeSchema);
