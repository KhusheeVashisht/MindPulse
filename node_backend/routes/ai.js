const express = require("express");
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const fastApi = axios.create({
  baseURL: process.env.FASTAPI_URL || "http://127.0.0.1:8000",
  timeout: 15000,
});

const huggingFace = axios.create({
  baseURL: "https://router.huggingface.co/v1",
  timeout: 30000,
});

const HF_MODEL = process.env.HF_MODEL || "moonshotai/Kimi-K2-Instruct-0905";

function getHfToken() {
  return process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || "";
}

function requireApiKey(response) {
  if (getHfToken()) {
    return false;
  }

  response.status(503).json({
    message:
      "The MindPulse AI layer is not configured yet. Add HF_TOKEN to the Node backend to unlock recommendations, reflection, and insights.",
  });
  return true;
}

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatHistoryItem(entry) {
  return {
    timestamp: entry.timestamp,
    prediction: entry.prediction,
    stress_level: safeNumber(entry.stress_level),
    anxiety_score: safeNumber(entry.anxiety_score),
    depression_score: safeNumber(entry.depression_score),
    sleep_hours: safeNumber(entry.sleep_hours),
    social_support: safeNumber(entry.social_support),
    screen_time: safeNumber(entry.screen_time),
    study_hours_per_day: safeNumber(entry.study_hours_per_day),
    academic_performance: safeNumber(entry.academic_performance),
    exam_pressure: safeNumber(entry.exam_pressure),
    financial_stress: safeNumber(entry.financial_stress),
    family_expectation: safeNumber(entry.family_expectation),
    physical_activity: safeNumber(entry.physical_activity),
  };
}

function buildTimeline(history) {
  return history.slice(0, 5).map(formatHistoryItem);
}

async function fetchUserHistory(userId) {
  const fastApiResponse = await fastApi.get("/history");
  const predictions = Array.isArray(fastApiResponse.data?.predictions)
    ? fastApiResponse.data.predictions.filter((item) => item.user_id === userId)
    : [];

  return predictions;
}

function latestSummary(history) {
  const latest = history[0];
  if (!latest) {
    return null;
  }

  return formatHistoryItem(latest);
}

function previousSummary(history) {
  const previous = history[1];
  if (!previous) {
    return null;
  }

  return formatHistoryItem(previous);
}

function extractStructuredJson(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("No structured AI output was returned.");
  }

  const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i) || content.match(/```\s*([\s\S]*?)```/i);
  const rawJson = fencedMatch ? fencedMatch[1].trim() : content.trim();

  return JSON.parse(rawJson);
}

function schemaToPrompt(schema) {
  if (!schema?.properties) {
    return "Return a valid JSON object only.";
  }

  const describe = (propertySchema) => {
    if (!propertySchema) {
      return "string";
    }

    if (propertySchema.type === "array") {
      if (propertySchema.items?.type === "object") {
        return `array of objects with keys: ${Object.keys(propertySchema.items.properties || {}).join(", ")}`;
      }
      return `array of ${propertySchema.items?.type || "values"}`;
    }

    if (propertySchema.type === "object") {
      return `object with keys: ${Object.keys(propertySchema.properties || {}).join(", ")}`;
    }

    return propertySchema.type || "string";
  };

  const lines = Object.entries(schema.properties).map(([key, value]) => `- ${key}: ${describe(value)}`);
  return `Return only valid JSON with this shape:\n${lines.join("\n")}`;
}

async function createStructuredResponse({ instructions, input, schema }) {
  const response = await huggingFace.post(
    "/chat/completions",
    {
      model: HF_MODEL,
      temperature: 0.3,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content: `${instructions}\n\n${schemaToPrompt(schema)}\nDo not include markdown, explanations, or code fences outside the JSON.`,
        },
        ...input.map((item) => ({
          role: item.role,
          content: item.content.map((block) => block.text).join("\n"),
        })),
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${getHfToken()}`,
        "Content-Type": "application/json",
      },
    }
  );

  return extractStructuredJson(response.data);
}

function labelSchemaInstructions(label) {
  return `${label} should stay supportive, specific, and easy to read for a student wellbeing app.`;
}

function normalizeRecommendations(data) {
  return {
    summary: String(data?.summary || ""),
    recommendations: Array.isArray(data?.recommendations)
      ? data.recommendations.slice(0, 4).map((item) => ({
          title: String(item?.title || "Helpful next step"),
          why_it_matters: String(item?.why_it_matters || ""),
          next_step: String(item?.next_step || ""),
        }))
      : [],
    encouragement: String(data?.encouragement || ""),
  };
}

function normalizeReflection(data) {
  return {
    reflection: String(data?.reflection || ""),
    gentle_reframe: String(data?.gentle_reframe || ""),
    prompts: Array.isArray(data?.prompts) ? data.prompts.slice(0, 3).map((item) => String(item)) : [],
  };
}

function normalizeInsights(data) {
  return {
    headline: String(data?.headline || ""),
    pattern_summary: String(data?.pattern_summary || ""),
    encouraging_signal: String(data?.encouraging_signal || ""),
    watch_item: String(data?.watch_item || ""),
    chart_points: Array.isArray(data?.chart_points)
      ? data.chart_points.slice(0, 4).map((item) => ({
          label: String(item?.label || "Signal"),
          insight: String(item?.insight || ""),
        }))
      : [],
  };
}

function handleAiError(error, response, label) {
  const status = error.response?.status || 500;
  const message =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    `${label} is currently unavailable.`;

  console.error(`${label} error:`, error.response?.data || error.message);
  response.status(status).json({ message });
}

function safeAiResponse(response, label, normalizer) {
  try {
    return normalizer(response);
  } catch (error) {
    throw new Error(`${label} returned a response MindPulse could not read.`);
  }
}

router.post("/ai/recommendations", authMiddleware, async (request, response) => {
  if (requireApiKey(response)) {
    return;
  }

  try {
    const history = await fetchUserHistory(request.user.id);
    const latest = latestSummary(history);

    if (!latest) {
      return response.status(400).json({
        message: "Complete at least one check-in before asking for personalized recommendations.",
      });
    }

    const previous = previousSummary(history);
    const timeline = buildTimeline(history);

    const data = await createStructuredResponse({
      instructions:
        "You are MindPulse, a calm student wellbeing companion. Generate grounded, non-clinical recommendations based only on the provided burnout check-in data. Do not diagnose. Do not mention suicide, crisis hotlines, or emergency warnings unless the input explicitly asks for urgent help. Keep the tone warm, practical, and supportive. " +
        labelSchemaInstructions("Personalized recommendations"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                user_name: request.user.name,
                latest_check_in: latest,
                previous_check_in: previous,
                recent_timeline: timeline,
                request:
                  "Create concise personalized recommendations the student can act on this week, grounded in the provided data only.",
              }),
            },
          ],
        },
      ],
      schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                why_it_matters: { type: "string" },
                next_step: { type: "string" },
              },
              required: ["title", "why_it_matters", "next_step"],
              additionalProperties: false,
            },
          },
          encouragement: { type: "string" },
        },
        required: ["summary", "recommendations", "encouragement"],
        additionalProperties: false,
      },
    });

    response.json(safeAiResponse(data, "Recommendations", normalizeRecommendations));
  } catch (error) {
    handleAiError(error, response, "Personalized recommendations");
  }
});

router.post("/ai/reflection", authMiddleware, async (request, response) => {
  if (requireApiKey(response)) {
    return;
  }

  try {
    const prompt = String(request.body?.prompt || "").trim();
    const draft = request.body?.draft && typeof request.body.draft === "object" ? request.body.draft : null;
    const history = await fetchUserHistory(request.user.id);

    if (!prompt) {
      return response.status(400).json({ message: "Add a reflection question before sending it to the assistant." });
    }

    const latest = latestSummary(history);

    const data = await createStructuredResponse({
      instructions:
        "You are MindPulse's Reflection Assistant. Respond like a thoughtful check-in companion for students. Be warm and specific, but not clinical. Help the student reflect on patterns, emotions, routines, and next steps. Keep the response short, grounded, and easy to read. " +
        labelSchemaInstructions("Reflection assistant"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                user_name: request.user.name,
                user_prompt: prompt,
                latest_check_in: latest,
                current_form_draft: draft,
                request:
                  "Reply with a supportive reflection, one simple reframe, and two journaling prompts that connect to the student's question and current context.",
              }),
            },
          ],
        },
      ],
      schema: {
        type: "object",
        properties: {
          reflection: { type: "string" },
          gentle_reframe: { type: "string" },
          prompts: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["reflection", "gentle_reframe", "prompts"],
        additionalProperties: false,
      },
    });

    response.json(safeAiResponse(data, "Reflection assistant", normalizeReflection));
  } catch (error) {
    handleAiError(error, response, "Reflection assistant");
  }
});

router.post("/ai/insights", authMiddleware, async (request, response) => {
  if (requireApiKey(response)) {
    return;
  }

  try {
    const history = await fetchUserHistory(request.user.id);
    const timeline = buildTimeline(history);

    if (timeline.length === 0) {
      return response.status(400).json({
        message: "Complete at least one check-in before generating insights.",
      });
    }

    const data = await createStructuredResponse({
      instructions:
        "You are MindPulse's Insight Generator. Turn burnout history into a few gentle, grounded observations. Focus on patterns and trend language rather than certainty. Avoid diagnosis and avoid inventing facts not present in the data. " +
        labelSchemaInstructions("Insight generator"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                user_name: request.user.name,
                recent_timeline: timeline,
                request:
                  "Summarize the main pattern, one encouraging signal, one watch item, and three short chart-ready insights from the recent timeline.",
              }),
            },
          ],
        },
      ],
      schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          pattern_summary: { type: "string" },
          encouraging_signal: { type: "string" },
          watch_item: { type: "string" },
          chart_points: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                insight: { type: "string" },
              },
              required: ["label", "insight"],
              additionalProperties: false,
            },
          },
        },
        required: ["headline", "pattern_summary", "encouraging_signal", "watch_item", "chart_points"],
        additionalProperties: false,
      },
    });

    response.json(safeAiResponse(data, "Insight generator", normalizeInsights));
  } catch (error) {
    handleAiError(error, response, "Insight generator");
  }
});

module.exports = router;
