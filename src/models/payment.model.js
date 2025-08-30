const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    amount: { type: Number, required: true },
    paymentRef: String,
    method: { type: String, enum: ['RAZORPAY', 'PAYTM', 'OTHER'] },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'PENDING' },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Payment', paymentSchema);
