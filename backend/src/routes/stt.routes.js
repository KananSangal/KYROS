const express = require("express");
const multer = require("multer");
const path = require("path");

const { transcribe } = require("../controllers/stt.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Temporary audio storage
const storage = multer.diskStorage({
  destination: "uploads/audio/",

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    cb(null, filename);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

// POST /api/stt/transcribe
router.post(
  "/transcribe",
  protect,
  upload.single("audio"),
  transcribe
);

module.exports = router;