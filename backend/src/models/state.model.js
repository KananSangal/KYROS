const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    capital: {
      type: String,
      required: true,
      trim: true
    },

    languages: {
      type: [String],
      default: []
    },

    greetings: {
      type: [
        {
          language: {
            type: String,
            required: true
          },
          text: {
            type: String,
            required: true
          },
          pronunciation: {
            type: String,
            default: ""
          }
        }
      ],
      default: []
    },

    festivals: {
      type: [String],
      default: []
    },

    cuisine: {
      type: [String],
      default: []
    },

    artsAndDance: {
      type: [String],
      default: []
    },

    heritage: {
      type: [String],
      default: []
    },

    description: {
      type: String,
      default: ""
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

module.exports = mongoose.model("State", stateSchema);