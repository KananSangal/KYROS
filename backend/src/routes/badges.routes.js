const express = require("express");

const {
  getBadges,
  getBadge,
  createBadge,
  awardBadge
} = require("../controllers/badge.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Get all badges
router.get("/", protect, getBadges);

// Award badge to a child
router.post("/award/:childId", protect, awardBadge);

// Get one badge
router.get("/:id", protect, getBadge);

// Create a badge
router.post("/", protect, createBadge);

module.exports = router;