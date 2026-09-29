const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    age: {
      type: Number,
      required: true,
      min: 1,
      max: 18
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    xp: {
      type: Number,
      default: 0
    },

    level: {
      type: Number,
      default: 1
    },

    badges: [
      {
        badge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Badge"
        },

        earnedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Child", childSchema);