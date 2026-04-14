export function getLatestPrediction(history) {
  return Array.isArray(history) && history.length > 0 ? history[0] : null;
}

export function getPreviousPrediction(history) {
  return Array.isArray(history) && history.length > 1 ? history[1] : null;
}

export function compareMetric(history, key, label, suffix = "") {
  const latest = getLatestPrediction(history);
  const previous = getPreviousPrediction(history);

  if (!latest || !previous) {
    return null;
  }

  const diff = Number(latest[key]) - Number(previous[key]);
  if (diff === 0) {
    return `Your ${label.toLowerCase()} stayed the same since your last check-in.`;
  }

  const direction = diff > 0 ? "increased" : "decreased";
  const prefix = diff > 0 ? "+" : "";
  return `Your ${label.toLowerCase()} ${direction} by ${prefix}${diff}${suffix} since last check.`;
}

export function summarizeChanges(history) {
  const latest = getLatestPrediction(history);
  const previous = getPreviousPrediction(history);

  if (!latest || !previous) {
    return {
      ready: false,
      emptyMessage: "Complete one more check-in to unlock your change summary and see what shifted since the previous result.",
      items: [],
    };
  }

  return {
    ready: true,
    emptyMessage: "",
    items: [
      compareMetric(history, "stress_level", "Stress"),
      compareMetric(history, "sleep_hours", "Sleep Hours", "h"),
      compareMetric(history, "social_support", "Social Support"),
    ].filter(Boolean),
  };
}
