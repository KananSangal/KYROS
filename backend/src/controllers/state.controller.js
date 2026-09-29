const State = require("../models/state.model");

// Get all active states
const getStates = async (req, res) => {
  try {
    const states = await State.find({
      isActive: true
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: states.length,
      states
    });
  } catch (error) {
    console.error("Get states error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching states"
    });
  }
};


// Get a single state
const getState = async (req, res) => {
  try {
    const state = await State.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found"
      });
    }

    res.status(200).json({
      success: true,
      state
    });
  } catch (error) {
    console.error("Get state error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching state"
    });
  }
};


// Get state by code
const getStateByCode = async (req, res) => {
  try {
    const state = await State.findOne({
      code: req.params.code.toUpperCase(),
      isActive: true
    });

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found"
      });
    }

    res.status(200).json({
      success: true,
      state
    });
  } catch (error) {
    console.error("Get state by code error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching state"
    });
  }
};


// Create a state
const createState = async (req, res) => {
  try {
    const {
      name,
      code,
      capital,
      languages,
      greetings,
      festivals,
      cuisine,
      artsAndDance,
      heritage,
      description
    } = req.body;

    if (!name || !code || !capital) {
      return res.status(400).json({
        success: false,
        message: "Name, code and capital are required"
      });
    }

    const existingState = await State.findOne({
      $or: [
        { name },
        { code: code.toUpperCase() }
      ]
    });

    if (existingState) {
      return res.status(409).json({
        success: false,
        message: "State already exists"
      });
    }

    const state = await State.create({
      name,
      code,
      capital,
      languages,
      greetings,
      festivals,
      cuisine,
      artsAndDance,
      heritage,
      description
    });

    res.status(201).json({
      success: true,
      message: "State created successfully",
      state
    });
  } catch (error) {
    console.error("Create state error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating state"
    });
  }
};


module.exports = {
  getStates,
  getState,
  getStateByCode,
  createState
};