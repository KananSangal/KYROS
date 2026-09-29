const Badge = require("../models/badge.model");
const Child = require("../models/child.model");

// Get all active badges
const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: badges.length,
      badges
    });
  } catch (error) {
    console.error("Get badges error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching badges"
    });
  }
};


// Get one badge
const getBadge = async (req, res) => {
  try {
    const badge = await Badge.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "Badge not found"
      });
    }

    res.status(200).json({
      success: true,
      badge
    });
  } catch (error) {
    console.error("Get badge error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching badge"
    });
  }
};


// Create a badge
const createBadge = async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      xpReward,
      requirement
    } = req.body;

    if (!name || !description || !requirement) {
      return res.status(400).json({
        success: false,
        message: "Name, description and requirement are required"
      });
    }

    const existingBadge = await Badge.findOne({ name });

    if (existingBadge) {
      return res.status(409).json({
        success: false,
        message: "Badge already exists"
      });
    }

    const badge = await Badge.create({
      name,
      description,
      icon,
      xpReward,
      requirement
    });

    res.status(201).json({
      success: true,
      message: "Badge created successfully",
      badge
    });
  } catch (error) {
    console.error("Create badge error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating badge"
    });
  }
};


// Award a badge to a child
const awardBadge = async (req, res) => {
  try {
    const { childId } = req.params;
    const { badgeId } = req.body;

    // Validate badge ID
    if (!badgeId) {
      return res.status(400).json({
        success: false,
        message: "Badge ID is required"
      });
    }

    // Find child belonging to logged-in parent
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

    // Find active badge
    const badge = await Badge.findOne({
      _id: badgeId,
      isActive: true
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "Badge not found"
      });
    }

    // Check if child already has this badge
    const alreadyEarned = child.badges.some(
      (item) => item.badge.toString() === badgeId
    );

    if (alreadyEarned) {
      return res.status(409).json({
        success: false,
        message: "Child has already earned this badge"
      });
    }

    // Add badge to child
    child.badges.push({
      badge: badge._id,
      earnedAt: new Date()
    });

    // Add badge XP
    child.xp += badge.xpReward || 0;

    // Update level
    child.level = Math.floor(child.xp / 100) + 1;

    await child.save();

    // Return populated badge information
    await child.populate("badges.badge");

    res.status(200).json({
      success: true,
      message: "Badge awarded successfully",
      reward: {
        badge: {
          id: badge._id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon
        },
        xpReward: badge.xpReward || 0
      },
      progress: {
        childId: child._id,
        childName: child.name,
        xp: child.xp,
        level: child.level,
        badges: child.badges
      }
    });
  } catch (error) {
    console.error("Award badge error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while awarding badge"
    });
  }
};


module.exports = {
  getBadges,
  getBadge,
  createBadge,
  awardBadge
};