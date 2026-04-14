const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  businessId: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  transcript: {
    type: String,
  },
  sentiment: {
    type: String,
  },
  keywords: {
    type: [String],
  },
  summary: {
    type: String,
  },
  issues: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);