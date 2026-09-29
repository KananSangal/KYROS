const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  chatWithAI,
  voiceChat
} = require("../controllers/ai.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Temporary audio storage
const storage = multer.diskStorage({
  destination: "uploads/audio/",

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    cb(null, filename);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

// Text chat
router.post("/chat", protect, chatWithAI);

// Voice chat: Audio → STT → AI
router.post(
  "/voice-chat",
  protect,
  upload.single("audio"),
  voiceChat
);

module.exports = router;