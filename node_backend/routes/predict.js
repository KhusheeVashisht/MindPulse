const express = require("express");
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const fastApi = axios.create({
  baseURL: process.env.FASTAPI_URL || "http://127.0.0.1:8000",
  timeout: 15000,
});

const fields = [
  "age",
  "gender",
  "academic_year",
  "study_hours_per_day",
  "exam_pressure",
  "academic_performance",
  "stress_level",
  "anxiety_score",
  "depression_score",
  "sleep_hours",
  "physical_activity",
  "social_support",
  "screen_time",
  "financial_stress",
  "family_expectation",
];

router.post("/predict", authMiddleware, async (request, response) => {
  try {
    const payload = { user_id: request.user.id };

    for (const field of fields) {
      if (request.body[field] === undefined || request.body[field] === null || request.body[field] === "") {
        return response.status(400).json({ message: `${field} is required.` });
      }
      payload[field] = request.body[field];
    }

    const fastApiResponse = await fastApi.post("/predict", payload);
    return response.json(fastApiResponse.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Prediction service is currently unavailable.";

    console.error("Predict proxy error:", error.response?.data || error.message);
    return response.status(status).json({ message });
  }
});

router.get("/history", authMiddleware, async (request, response) => {
  try {
    const fastApiResponse = await fastApi.get("/history");
    const predictions = Array.isArray(fastApiResponse.data?.predictions)
      ? fastApiResponse.data.predictions.filter((item) => item.user_id === request.user.id)
      : [];

    return response.json({ predictions });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "History service is currently unavailable.";

    console.error("History proxy error:", error.response?.data || error.message);
    return response.status(status).json({ message });
  }
});

module.exports = router;
