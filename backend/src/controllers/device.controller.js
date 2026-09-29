const fs = require("fs");
const path = require("path");

const { transcribeAudio } = require("../services/stt.service");
const { generateAIResponse } = require("../services/ai.service");
const { generateSpeech } = require("../services/tts.service");

const State = require("../models/state.model");
const Child = require("../models/child.model");


// =====================================================
// DEVICE INTERACTION
// ESP32 → AI → TTS → AUDIO URL
// =====================================================

const deviceInteraction = async (req, res) => {
  let outputPath = null;

  try {

    const {
      deviceId,
      message,
      childId,
      stateCode
    } = req.body;


    if (!message || !message.trim()) {

      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }


    console.log("");
    console.log("=================================");
    console.log("       KYROS DEVICE INTERACTION");
    console.log("=================================");
    console.log("Device:", deviceId || "Unknown");
    console.log("Message:", message);
    console.log("=================================");
    console.log("");


    // =================================================
    // CHILD CONTEXT
    // =================================================

    let childContext = null;

    if (childId) {

      const child =
        await Child.findById(childId);

      if (child) {

        childContext = {
          name: child.name,
          age: child.age,
          level: child.level,
          xp: child.xp
        };
      }
    }


    // =================================================
    // CULTURAL CONTEXT
    // =================================================

    let culturalContext = null;

    if (stateCode) {

      const state =
        await State.findOne({
          code: stateCode.toUpperCase(),
          isActive: true
        });

      if (state) {

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
    }


    // =================================================
    // AI
    // =================================================

    console.log("🤖 Generating AI response...");

    const reply =
      await generateAIResponse(
        message,
        culturalContext,
        childContext
      );

    console.log("💬 AI:", reply);


    // =================================================
    // TTS
    // =================================================

    const outputFileName =
      `kyros-response-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.wav`;


    outputPath =
      path.join(
        process.cwd(),
        "uploads",
        "audio",
        outputFileName
      );


    console.log("🔊 Generating TTS...");

    await generateSpeech(
      reply,
      outputPath
    );


    console.log(
      "✅ TTS generated:",
      outputFileName
    );


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      deviceId:
        deviceId || "KYROS-ESP32",

      reply,

      audio: {
        fileName: outputFileName,
        path:
          `/uploads/audio/${outputFileName}`
      },

      child:
        childContext
          ? {
              name: childContext.name,
              age: childContext.age
            }
          : null,

      context:
        culturalContext
          ? {
              type: "state",
              state:
                culturalContext.stateName
            }
          : null
    });

  } catch (error) {

    console.error("");
    console.error(
      "❌ DEVICE INTERACTION ERROR"
    );
    console.error(error);
    console.error("");

    return res.status(500).json({

      success: false,

      message:
        "KYROS device interaction failed",

      error:
        error.message
    });
  }
};


// =====================================================
// EXISTING DEVICE VOICE
// =====================================================

const deviceVoice = async (req, res) => {

  let inputPath = null;
  let outputPath = null;

  try {

    if (
      !req.body ||
      !Buffer.isBuffer(req.body) ||
      req.body.length === 0
    ) {

      return res.status(400).json({
        success: false,
        message: "WAV audio data is required"
      });
    }


    const inputFileName =
      `esp32-input-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.wav`;


    inputPath =
      path.join(
        process.cwd(),
        "uploads",
        "audio",
        inputFileName
      );


    fs.writeFileSync(
      inputPath,
      req.body
    );


    const childId =
      req.headers["x-kyros-child-id"];


    let childContext = null;


    if (childId) {

      const child =
        await Child.findById(childId);

      if (child) {

        childContext = {
          name: child.name,
          age: child.age,
          level: child.level,
          xp: child.xp
        };
      }
    }


    const stateCode =
      req.headers["x-kyros-state-code"];


    let culturalContext = null;


    if (stateCode) {

      const state =
        await State.findOne({
          code:
            stateCode.toUpperCase(),
          isActive: true
        });


      if (state) {

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
    }


    const transcript =
      await transcribeAudio(
        inputPath
      );


    if (
      !transcript ||
      !transcript.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Could not understand the audio",

        inputAudio: {
          fileName:
            inputFileName,

          path:
            `/uploads/audio/${inputFileName}`
        }
      });
    }


    const reply =
      await generateAIResponse(
        transcript,
        culturalContext,
        childContext
      );


    const outputFileName =
      `kyros-response-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.wav`;


    outputPath =
      path.join(
        process.cwd(),
        "uploads",
        "audio",
        outputFileName
      );


    await generateSpeech(
      reply,
      outputPath
    );


    return res.status(200).json({

      success: true,

      transcript,

      reply,

      inputAudio: {
        fileName:
          inputFileName,

        path:
          `/uploads/audio/${inputFileName}`
      },

      audio: {
        fileName:
          outputFileName,

        path:
          `/uploads/audio/${outputFileName}`
      }
    });

  } catch (error) {

    console.error(
      "❌ KYROS DEVICE VOICE ERROR"
    );

    console.error(error);

    return res.status(500).json({

      success: false,

      message:
        "KYROS voice processing failed",

      error:
        error.message
    });

  } finally {

    if (
      inputPath &&
      fs.existsSync(inputPath)
    ) {

      fs.unlinkSync(inputPath);
    }
  }
};


module.exports = {
  deviceVoice,
  deviceInteraction
};