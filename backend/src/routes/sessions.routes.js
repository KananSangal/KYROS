const express = require("express");

const {
  startSession,
  endSession,
  getChildSessions
} = require("../controllers/session.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();


// Start a new session
router.post("/", protect, startSession);


// End a session
router.post("/:id/end", protect, endSession);


// Get child session history
router.get("/child/:childId", protect, getChildSessions);


module.exports = router;