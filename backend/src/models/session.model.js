const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true
    },

    type: {
      type: String,
      enum: [
        "story",
        "cultural",
        "quiz",
        "riddle",
        "conversation",
        "greeting",
        "other"
      ],
      default: "conversation"
    },

    title: {
      type: String,
      trim: true,
      default: ""
    },

    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      default: null
    },

    language: {
      type: String,
      default: "English",
      trim: true
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    endedAt: {
      type: Date,
      default: null
    },

    durationSeconds: {
      type: Number,
      default: 0,
      min: 0
    },

    xpEarned: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Session", sessionSchema);