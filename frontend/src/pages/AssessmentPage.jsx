import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import AiFeatureCard from "../components/AiFeatureCard";
import PredictionForm from "../components/PredictionForm";
import { aiService, predictionService } from "../services/api";

export default function AssessmentPage({ user, onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftForm, setDraftForm] = useState(null);
  const [reflectionPrompt, setReflectionPrompt] = useState("");
  const [reflectionData, setReflectionData] = useState(null);
  const [reflectionError, setReflectionError] = useState("");
  const [reflectionLoading, setReflectionLoading] = useState(false);

  const handlePredictionSubmit = async (formData) => {
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const data = await predictionService.predict(formData);
      const result = data.burnout_prediction || "Unknown";
      setPrediction(result);
      setSuccess("Check-in saved successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to complete prediction.");
      if (requestError.response?.status === 401) {
        onLogout();
        navigate("/login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReflectionSubmit = async (event) => {
    event.preventDefault();
    setReflectionError("");
    setReflectionLoading(true);

    try {
      const data = await aiService.reflect({
        prompt: reflectionPrompt,
        draft: draftForm,
      });
      setReflectionData(data);
    } catch (requestError) {
      setReflectionError(requestError.response?.data?.message || "Unable to open the reflection assistant right now.");
      if (requestError.response?.status === 401) {
        onLogout();
        navigate("/login");
      }
    } finally {
      setReflectionLoading(false);
    }
  };

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      title="Self Assessment"
      description="Use the sliders and prompts below for a more thoughtful check-in. Nothing technical here, just a clear reflection of how things have felt lately."
    >
      <div className="space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel transition-colors dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <PredictionForm onSubmit={handlePredictionSubmit} loading={submitting} onFormChange={setDraftForm} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel transition-colors dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Latest Check-in</p>
            <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">Your Burnout Results</h3>
            <div className="mt-6 rounded-[28px] bg-slate-50 p-6 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current burnout risk</p>
              <p className="mt-3 font-display text-4xl text-ink dark:text-slate-100">{prediction || "Waiting for your check-in"}</p>
            </div>
            {success ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
            {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel transition-colors dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">How To Rate</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <li>Use the sliders to describe the recent few weeks, not just the best or worst day.</li>
              <li>For each slider, 1 means low and 10 means high.</li>
              <li>When you finish, your result is saved automatically into your private history.</li>
            </ul>
          </div>
        </section>

        <AiFeatureCard
          eyebrow="Reflection Assistant"
          title="Talk through the check-in before you submit it"
          description="Ask MindPulse to help you make sense of what the sliders might be saying. This stays reflective and supportive, not clinical."
          loading={reflectionLoading}
          error={reflectionError}
          empty={!reflectionData ? "Try a question like: What stands out in this check-in? or What should I pay attention to this week?" : ""}
          alwaysShowChildren
        >
          <form className="space-y-4" onSubmit={handleReflectionSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">What would you like help reflecting on?</span>
              <textarea
                value={reflectionPrompt}
                onChange={(event) => setReflectionPrompt(event.target.value)}
                rows="4"
                placeholder="For example: My stress is high but my sleep is okay. What might that mean?"
                className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:border-ember focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-900/40"
                required
              />
            </label>

            <button
              type="submit"
              disabled={reflectionLoading || !reflectionPrompt.trim()}
              className="inline-flex items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reflectionLoading ? "Reflecting..." : "Open Reflection Assistant"}
            </button>

            {reflectionData ? (
              <div className="grid gap-4 pt-2 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Reflection</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{reflectionData.reflection}</p>
                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">Gentle reframe</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{reflectionData.gentle_reframe}</p>
                  </div>
                </div>

                <div className="rounded-[24px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Journal prompts</p>
                  <div className="mt-3 space-y-3">
                    {reflectionData.prompts?.map((item) => (
                      <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </AiFeatureCard>
      </div>
    </AppShell>
  );
}
