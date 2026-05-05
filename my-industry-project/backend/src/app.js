const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

//health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Application is healthy and running",
    uptime: process.uptime(),
    // timestamp: new Date().toISOString,
  });
});

module.exports = app;
