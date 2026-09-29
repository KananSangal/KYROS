const fs = require("fs");
const { transcribeAudio } = require("../services/stt.service");

const transcribe = async (req, res) => {
  let audioPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required"
      });
    }

    audioPath = req.file.path;

    const text = await transcribeAudio(audioPath);

    res.status(200).json({
      success: true,
      text
    });

  } catch (error) {
    console.error("STT controller error:", error.message);

    res.status(500).json({
      success: false,
      message: "Speech transcription failed"
    });

  } finally {
    // Delete temporary audio file after processing
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
};

module.exports = {
  transcribe
};