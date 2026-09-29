const express = require("express");

const {
  register,
  login,
  getMe
} = require("../controllers/auth.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth API is working"
  });
});

module.exports = router;