const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/database");

// Routes
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const childrenRoutes = require("./routes/children.routes");
const storiesRoutes = require("./routes/stories.routes");
const culturalRoutes = require("./routes/cultural.routes");
const sessionsRoutes = require("./routes/sessions.routes");
const progressRoutes = require("./routes/progress.routes");
const gamificationRoutes = require("./routes/gamification.routes");
const devicesRoutes = require("./routes/devices.routes");
const aiRoutes = require("./routes/ai.routes");
const badgeRoutes = require("./routes/badges.routes");
const sttRoutes = require("./routes/stt.routes");
const deviceRoutes = require("./routes/device.routes");

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 KYROS Backend running on http://localhost:${PORT}`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// API Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/cultural", culturalRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/stt", sttRoutes);
app.use("/api/device", deviceRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to KYROS API"
  });
});

// Start server
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 KYROS Backend running on http://localhost:${PORT}`);
});