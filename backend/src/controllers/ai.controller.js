const fs = require("fs");
const path = require("path");

const { generateAIResponse } = require("../services/ai.service");
const { transcribeAudio } = require("../services/stt.service");

const { generateSpeech } = require("../services/tts.service");

const State = require("../models/state.model");
const Child = require("../models/child.model");

const chatWithAI = async (req, res) => {
  try {
    const { message, stateCode, childId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    let culturalContext = null;
    let childContext = null;

    if (childId) {
      const child = await Child.findOne({
        _id: childId,
        parent: req.user.userId
      });

      if (!child) {
        return res.status(404).json({
          success: false,
          message: "Child not found"
        });
      }

      childContext = {
        name: child.name,
        age: child.age,
        level: child.level,
        xp: child.xp
      };
    }

    if (stateCode) {
      const state = await State.findOne({
        code: stateCode.toUpperCase(),
        isActive: true
      });

      if (!state) {
        return res.status(404).json({
          success: false,
          message: "Cultural state not found"
        });
      }

      culturalContext = {
        stateName: state.name,
        capital: state.capital,
        languages: state.languages,
        greetings: state.greetings,
        festivals: state.festivals,
        cuisine: state.cuisine,
        artsAndDance: state.artsAndDance,
        heritage: state.heritage,
        description: state.description
      };
    }

    const reply = await generateAIResponse(
      message,
      culturalContext,
      childContext
    );

    res.status(200).json({
      success: true,
      reply,
      child: childContext
        ? {
            name: childContext.name,
            age: childContext.age
          }
        : null,
      context: culturalContext
        ? {
            type: "state",
            state: culturalContext.stateName
          }
        : null
    });
  } catch (error) {
    console.error("AI controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to process AI request"
    });
  }
};

const voiceChat = async (req, res) => {
  let audioPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required"
      });
    }

    audioPath = req.file.path;

    const { stateCode, childId } = req.body;

    let childContext = null;

    if (childId) {
      const child = await Child.findOne({
        _id: childId,
        parent: req.user.userId
      });

      if (!child) {
        return res.status(404).json({
          success: false,
          message: "Child not found"
        });
      }

      childContext = {
        name: child.name,
        age: child.age,
        level: child.level,
        xp: child.xp
      };
    }

    let culturalContext = null;

    if (stateCode) {
      const state = await State.findOne({
        code: stateCode.toUpperCase(),
        isActive: true
      });

      if (!state) {
        return res.status(404).json({
          success: false,
          message: "Cultural state not found"
        });
      }

      culturalContext = {
        stateName: state.name,
        capital: state.capital,
        languages: state.languages,
        greetings: state.greetings,
        festivals: state.festivals,
        cuisine: state.cuisine,
        artsAndDance: state.artsAndDance,
        heritage: state.heritage,
        description: state.description
      };
    }

    const transcript = await transcribeAudio(audioPath);

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not understand the audio"
      });
    }

    const reply = await generateAIResponse(
      transcript,
      culturalContext,
      childContext
    );

    const outputFileName =
      `kyros-response-${Date.now()}-${Math.round(Math.random() * 1e9)}.wav`;

    const outputPath = path.join(
      process.cwd(),
      "uploads",
      "audio",
      outputFileName
    );

    await generateSpeech(reply, outputPath);

    res.status(200).json({
      success: true,
      transcript,
      reply,
      audio: {
        fileName: outputFileName,
        path: `/uploads/audio/${outputFileName}`
      },
      child: childContext
        ? {
            name: childContext.name,
            age: childContext.age
          }
        : null,
      context: culturalContext
        ? {
            type: "state",
            state: culturalContext.stateName
          }
        : null
    });
    } catch (error) {
    console.error("VOICE CHAT ACTUAL ERROR:", error);
    console.error("VOICE CHAT ERROR MESSAGE:", error.message);
    console.error("VOICE CHAT ERROR STACK:", error.stack);

    res.status(500).json({
      success: false,
      message: "Voice chat failed",
      error: error.message
    });
  } finally {
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
};

module.exports = {
  chatWithAI,
  voiceChat
};