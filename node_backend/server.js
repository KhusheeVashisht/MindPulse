const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const predictRoutes = require("./routes/predict");
const aiRoutes = require("./routes/ai");
const authMiddleware = require("./middleware/authMiddleware");
const { initializeDatabase } = require("./database/db");

function loadLocalEnv() {
  const envFiles = [
    path.resolve(__dirname, ".env"),
    path.resolve(__dirname, "..", ".env"),
  ];

  envFiles.forEach((envPath) => {
    if (!fs.existsSync(envPath)) {
      return;
    }

    const content = fs.readFileSync(envPath, "utf-8");
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.split("#")[0].trim();
      if (!trimmed) {
        return;
      }
      const [key, ...rest] = trimmed.split("=");
      if (!key) {
        return;
      }
      const value = rest.join("=").trim();
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  });
}

loadLocalEnv();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    status: "ok",
    service: "mindpulse-node-backend",
    message: "MindPulse Node backend is running. Use the React app on http://localhost:5173.",
  });
});

app.get("/health", (request, response) => {
  response.json({ status: "ok", service: "mindpulse-node-backend" });
});

app.use("/", authRoutes);
app.use("/", predictRoutes);
app.use("/", aiRoutes);

app.get("/me", authMiddleware, (request, response) => {
  response.json({ user: request.user });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MindPulse Node backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize Node backend:", error);
    process.exit(1);
  });
