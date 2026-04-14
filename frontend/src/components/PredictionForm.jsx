import { useEffect, useState } from "react";

const initialForm = {
  age: 20,
  gender: "Male",
  academic_year: 2,
  study_hours_per_day: 4,
  exam_pressure: 5,
  academic_performance: 75,
  stress_level: 5,
  anxiety_score: 4,
  depression_score: 3,
  sleep_hours: 7,
  physical_activity: 5,
  social_support: 6,
  screen_time: 5,
  financial_stress: 4,
  family_expectation: 6,
};

const overviewFields = [
  {
    name: "age",
    label: "Age",
    type: "number",
    min: 16,
    max: 35,
    step: "1",
    hint: "Recommended range: 16 to 35 years.",
  },
  { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  {
    name: "academic_year",
    label: "Academic Year",
    type: "number",
    min: 1,
    max: 6,
    step: "1",
    hint: "Use a realistic year of study, usually between 1 and 6.",
  },
  {
    name: "study_hours_per_day",
    label: "Study Hours Per Day",
    type: "number",
    min: 0,
    max: 16,
    step: "0.5",
    hint: "Keep this within a believable daily routine, up to 16 hours.",
  },
  {
    name: "sleep_hours",
    label: "Sleep Hours Per Night",
    type: "number",
    min: 2,
    max: 14,
    step: "0.5",
    hint: "A realistic nightly sleep range is about 2 to 14 hours.",
  },
  {
    name: "academic_performance",
    label: "Academic Performance (%)",
    type: "number",
    min: 0,
    max: 100,
    step: "1",
    hint: "Enter a percentage between 0 and 100.",
  },
  {
    name: "screen_time",
    label: "Screen Time Per Day",
    type: "number",
    min: 0,
    max: 16,
    step: "0.5",
    hint: "Try to keep this to a realistic daily estimate, up to 16 hours.",
  },
];

const sliderFields = [
  {
    name: "stress_level",
    label: "How stressed do you feel lately?",
    description: "Think about deadlines, workload, and how tense or overwhelmed your days have felt.",
  },
  {
    name: "anxiety_score",
    label: "How anxious have you felt recently?",
    description: "Rate how often worry, nervousness, or racing thoughts have been showing up for you.",
  },
  {
    name: "depression_score",
    label: "How low or sad have you been feeling?",
    description: "Use a higher score if motivation, mood, or emotional heaviness has felt harder than usual.",
  },
  {
    name: "financial_stress",
    label: "How worried are you about money?",
    description: "Consider tuition, daily expenses, or any money pressure that has been on your mind.",
  },
  {
    name: "family_expectation",
    label: "How much pressure do you feel from family expectations?",
    description: "Think about academic, career, or personal expectations that may be weighing on you.",
  },
  {
    name: "social_support",
    label: "How supported do you feel by friends and family?",
    description: "A lower score means you feel less supported right now, while a higher score means you feel well backed.",
  },
  {
    name: "exam_pressure",
    label: "How intense does exam pressure feel right now?",
    description: "Rate the pressure you feel around tests, deadlines, and academic evaluation.",
  },
  {
    name: "physical_activity",
    label: "How active has your routine been lately?",
    description: "A higher score means movement, exercise, or physical activity has been a steady part of your week.",
  },
];

export default function PredictionForm({ onSubmit, loading, onFormChange }) {
  const [formData, setFormData] = useState(initialForm);
  const [overviewError, setOverviewError] = useState("");

  useEffect(() => {
    if (onFormChange) {
      onFormChange(formData);
    }
  }, [formData, onFormChange]);

  const getSliderVisual = (value, invert = false) => {
    const normalized = ((Number(value) - 1) / 9) * 100;
    const hue = invert ? 140 - normalized * 1.1 : 140 - normalized * 1.2;
    const color = `hsl(${hue}, 72%, 48%)`;
    const soft = `hsl(${hue}, 78%, 92%)`;
    return {
      color,
      soft,
      background: `linear-gradient(90deg, ${color} 0%, ${color} ${normalized}%, #e2e8f0 ${normalized}%, #e2e8f0 100%)`,
    };
  };

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "number" || type === "range" ? Number(value) : value,
    }));
    setOverviewError("");
  };

  const clampOverviewValue = (name, value) => {
    const field = overviewFields.find((item) => item.name === name);
    if (!field || field.type === "select") {
      return value;
    }

    if (Number.isNaN(value)) {
      return field.min;
    }

    if (value < field.min) {
      return field.min;
    }

    if (value > field.max) {
      return field.max;
    }

    return value;
  };

  const handleOverviewBlur = (event) => {
    const { name, value } = event.target;
    const numericValue = Number(value);
    const safeValue = clampOverviewValue(name, numericValue);

    if (numericValue !== safeValue) {
      const field = overviewFields.find((item) => item.name === name);
      setOverviewError(`${field.label} was adjusted to stay within the realistic range.`);
    }

    setFormData((current) => ({
      ...current,
      [name]: safeValue,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const sanitized = { ...formData };
    for (const field of overviewFields) {
      if (field.type !== "select") {
        sanitized[field.name] = clampOverviewValue(field.name, Number(sanitized[field.name]));
      }
    }
    setFormData(sanitized);
    onSubmit(sanitized);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 transition-colors dark:border-slate-700 dark:bg-slate-800/70">
        <h3 className="font-display text-2xl text-ink dark:text-slate-100">Self Assessment</h3>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
          Answer these check-in prompts based on how the student has been feeling lately. Use 1 for low and 10 for high.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewFields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm font-semibold text-ink dark:text-slate-100">{field.label}</span>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-ember focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-900/40"
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={formData[field.name]}
                onChange={handleChange}
                onBlur={handleOverviewBlur}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-ember focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-900/40"
                required
              />
            )}
            {field.hint ? <span className="mt-2 block text-xs leading-5 text-slate-400 dark:text-slate-500">{field.hint}</span> : null}
          </label>
        ))}
      </div>
      {overviewError ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">{overviewError}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {sliderFields.map((field) => {
          const invert = field.name === "social_support" || field.name === "physical_activity";
          const sliderVisual = getSliderVisual(formData[field.name], invert);

          return (
          <label key={field.name} className="block rounded-[26px] border border-slate-200 bg-white p-5 transition-colors dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="block text-base font-semibold text-ink dark:text-slate-100">{field.label}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-500 dark:text-slate-400">{field.description}</span>
              </div>
              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: sliderVisual.soft, color: sliderVisual.color }}
              >
                {formData[field.name]}
              </span>
            </div>
            <input
              name={field.name}
              type="range"
              min="1"
              max="10"
              step="1"
              value={formData[field.name]}
              onChange={handleChange}
              className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full"
              style={{ background: sliderVisual.background, accentColor: sliderVisual.color }}
            />
            <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              <span>1 = Low</span>
              <span>10 = High</span>
            </div>
          </label>
        )})}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Checking in..." : "See Burnout Check-in Result"}
      </button>
    </form>
  );
}
