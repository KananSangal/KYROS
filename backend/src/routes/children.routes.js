const express = require("express");

const {
  createChild,
  getChildren,
  getChild
} = require("../controllers/child.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createChild);

router.get("/", protect, getChildren);

router.get("/:id", protect, getChild);

module.exports = router;