const Child = require("../models/child.model");

// Get child progress
const getChildProgress = async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.childId,
      parent: req.user.userId
    }).populate("badges.badge");

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found"
      });
    }

    res.status(200).json({
      success: true,
      progress: {
        childId: child._id,
        childName: child.name,
        age: child.age,
        xp: child.xp,
        level: child.level,
        badges: child.badges
      }
    });
  } catch (error) {
    console.error("Get child progress error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching child progress"
    });
  }
};


// Add XP to child
const addXP = async (req, res) => {
  try {
    const { xp } = req.body;

    if (!xp || xp <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid XP amount is required"
      });
    }

    const child = await Child.findOne({
      _id: req.params.childId,
      parent: req.user.userId
    }).populate("badges.badge");

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found"
      });
    }

    child.xp += xp;

    child.level = Math.floor(child.xp / 100) + 1;

    await child.save();

    await child.populate("badges.badge");

    res.status(200).json({
      success: true,
      message: "XP added successfully",
      progress: {
        childId: child._id,
        childName: child.name,
        age: child.age,
        xp: child.xp,
        level: child.level,
        badges: child.badges
      }
    });
  } catch (error) {
    console.error("Add XP error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while adding XP"
    });
  }
};


module.exports = {
  getChildProgress,
  addXP
};