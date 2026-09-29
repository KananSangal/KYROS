const Story = require("../models/story.model");

// Get stories with optional filters
const getStories = async (req, res) => {
  try {
    const { age, category, language, state } = req.query;

    const filter = {
      isActive: true
    };

    // Age-based filtering
    if (age) {
      const childAge = Number(age);

      if (isNaN(childAge)) {
        return res.status(400).json({
          success: false,
          message: "Age must be a valid number"
        });
      }

      filter.ageMin = { $lte: childAge };
      filter.ageMax = { $gte: childAge };
    }

    // Category filtering
    if (category) {
      filter.category = category;
    }

    // Language filtering
    if (language) {
      filter.language = language;
    }

    // State filtering
    if (state) {
      filter.state = state;
    }

    const stories = await Story.find(filter).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: stories.length,
      filters: {
        age: age || null,
        category: category || null,
        language: language || null,
        state: state || null
      },
      stories
    });
  } catch (error) {
    console.error("Get stories error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching stories"
    });
  }
};


// Get single story
const getStory = async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    res.status(200).json({
      success: true,
      story
    });
  } catch (error) {
    console.error("Get story error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching story"
    });
  }
};


// Create story
const createStory = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      state,
      ageMin,
      ageMax,
      content,
      language
    } = req.body;

    if (!title || !description || !category || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and content are required"
      });
    }

    const story = await Story.create({
      title,
      description,
      category,
      state,
      ageMin,
      ageMax,
      content,
      language
    });

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story
    });
  } catch (error) {
    console.error("Create story error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating story"
    });
  }
};


module.exports = {
  getStories,
  getStory,
  createStory
};