const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: [
        "mahabharata",
        "ramayana",
        "panchatantra",
        "folk_tale",
        "moral",
        "historical",
        "regional",
        "cultural"
      ],
      required: true
    },

    state: {
      type: String,
      default: null
    },

    ageMin: {
      type: Number,
      default: 5
    },

    ageMax: {
      type: Number,
      default: 14
    },

    content: {
      type: String,
      required: true
    },

    language: {
      type: String,
      default: "English"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Story", storySchema);