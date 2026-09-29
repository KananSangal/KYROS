const express = require("express");

const {
  getStories,
  getStory,
  createStory
} = require("../controllers/story.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getStories);

router.get("/:id", protect, getStory);

router.post("/", protect, createStory);

module.exports = router;