const Groq = require("groq-sdk");
const fs = require("fs");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const generateSpeech = async (text, outputPath) => {
  try {
    if (!text || !text.trim()) {
      throw new Error("Text is required");
    }

    const response = await groq.audio.speech.create({
      model: "canopylabs/orpheus-v1-english",
      voice: "hannah",
      input: text,
      response_format: "wav"
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    await fs.promises.writeFile(outputPath, buffer);

    return outputPath;

  } catch (error) {
    console.error("Groq TTS error:", error);
    throw new Error("Speech generation failed");
  }
};

module.exports = {
  generateSpeech
};
