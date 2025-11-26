const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true,
  },
  auditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewComment: String,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  fraudIndicators: [{ type: String }],
  auditedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Audit", auditSchema);
