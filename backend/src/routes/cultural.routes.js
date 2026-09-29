const express = require("express");

const {
  getStates,
  getState,
  getStateByCode,
  createState
} = require("../controllers/state.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Get all states
router.get("/states", protect, getStates);

// Get state by MongoDB ID
router.get("/states/:id", protect, getState);

// Get state by state code
router.get("/states/code/:code", protect, getStateByCode);

// Create a new state
router.post("/states", protect, createState);

module.exports = router;