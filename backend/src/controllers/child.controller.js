const Child = require("../models/child.model");

// Create child
const createChild = async (req, res) => {
  try {
    const { name, age } = req.body;

    if (!name || !age) {
      return res.status(400).json({
        success: false,
        message: "Child name and age are required"
      });
    }

    const child = await Child.create({
      name,
      age,
      parent: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: "Child created successfully",
      child
    });
  } catch (error) {
    console.error("Create child error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating child"
    });
  }
};


// Get parent's children
const getChildren = async (req, res) => {
  try {
    const children = await Child.find({
      parent: req.user.userId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: children.length,
      children
    });
  } catch (error) {
    console.error("Get children error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching children"
    });
  }
};


// Get single child
const getChild = async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.id,
      parent: req.user.userId
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found"
      });
    }

    res.status(200).json({
      success: true,
      child
    });
  } catch (error) {
    console.error("Get child error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching child"
    });
  }
};


module.exports = {
  createChild,
  getChildren,
  getChild
};