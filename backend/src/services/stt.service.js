const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const transcribeAudio = async (audioFilePath, language = null) => {
  try {
    if (!audioFilePath) {
      throw new Error("Audio file is required");
    }

    const transcription = await groq.audio.transcriptions.create({
      file: require("fs").createReadStream(audioFilePath),

      model: "whisper-large-v3-turbo",

      ...(language ? { language } : {}),

      response_format: "json",

      temperature: 0
    });

    return transcription.text;

  } catch (error) {
    console.error("Groq STT error:", error);

    throw new Error("Speech transcription failed");
  }
};

module.exports = {
  transcribeAudio
};