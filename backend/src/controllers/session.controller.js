const Session = require("../models/session.model");
const Child = require("../models/child.model");

// Start a new session
const startSession = async (req, res) => {
  try {
    const {
      childId,
      type,
      title,
      state,
      language
    } = req.body;

    if (!childId) {
      return res.status(400).json({
        success: false,
        message: "Child ID is required"
      });
    }

    // Make sure child belongs to logged-in parent
    const child = await Child.findOne({
      _id: childId,
      parent: req.user.userId
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found"
      });
    }

    const session = await Session.create({
      child: child._id,
      type: type || "conversation",
      title: title || "",
      state: state || null,
      language: language || "English",
      startedAt: new Date(),
      status: "active"
    });

    res.status(201).json({
      success: true,
      message: "Session started successfully",
      session
    });
  } catch (error) {
    console.error("Start session error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while starting session"
    });
  }
};


// End a session and award XP
const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    // Make sure session's child belongs to logged-in parent
    const child = await Child.findOne({
      _id: session.child,
      parent: req.user.userId
    });

    if (!child) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this session"
      });
    }

    if (session.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Session is already completed or cancelled"
      });
    }

    const endedAt = new Date();

    // Calculate duration in seconds
    const durationSeconds = Math.max(
      0,
      Math.floor((endedAt - session.startedAt) / 1000)
    );

    /*
      XP rules:

      1-59 seconds   = 5 XP
      60-299 seconds = 10 XP
      300+ seconds   = 20 XP
    */

    let xpEarned = 5;

    if (durationSeconds >= 300) {
      xpEarned = 20;
    } else if (durationSeconds >= 60) {
      xpEarned = 10;
    }

    // Update session
    session.endedAt = endedAt;
    session.durationSeconds = durationSeconds;
    session.xpEarned = xpEarned;
    session.status = "completed";

    // Update child XP
    child.xp += xpEarned;

    // Update child level
    child.level = Math.floor(child.xp / 100) + 1;

    await session.save();
    await child.save();

    res.status(200).json({
      success: true,
      message: "Session ended successfully",
      session: {
        id: session._id,
        child: session.child,
        type: session.type,
        title: session.title,
        language: session.language,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationSeconds: session.durationSeconds,
        xpEarned: session.xpEarned,
        status: session.status
      },
      progress: {
        childId: child._id,
        childName: child.name,
        xp: child.xp,
        level: child.level
      }
    });
  } catch (error) {
    console.error("End session error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while ending session"
    });
  }
};


// Get child session history
const getChildSessions = async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.childId,
      parent: req.user.userId
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found"
      });
    }

    const sessions = await Session.find({
      child: child._id
    })
      .populate("state", "name code capital")
      .sort({ startedAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error("Get child sessions error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching sessions"
    });
  }
};


module.exports = {
  startSession,
  endSession,
  getChildSessions
};