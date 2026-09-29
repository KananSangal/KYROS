const express = require("express");

const {
  getChildProgress,
  addXP
} = require("../controllers/progress.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:childId", protect, getChildProgress);

router.post("/:childId/xp", protect, addXP);

module.exports = router;