import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema(
  {
    destinationUrl: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    lastVisitedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

shortUrlSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $type: "date" } },
  }
);

export default mongoose.model("ShortUrl", shortUrlSchema);
