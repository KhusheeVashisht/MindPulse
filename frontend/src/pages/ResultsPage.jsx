import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import AiFeatureCard from "../components/AiFeatureCard";
import { aiService, predictionService } from "../services/api";
import { getLatestPrediction, summarizeChanges } from "../utils/insights";

function riskBadgeClasses(risk) {
  if (risk === "Low") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (risk === "High") {
    return "bg-red-50 text-red-700";
  }
  return "bg-amber-50 text-amber-700";
}

export default function ResultsPage({ user, onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [insights, setInsights] = useState(null);
  const [insightsError, setInsightsError] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await predictionService.history();
        setHistory(data.predictions || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load results.");
        if (requestError.response?.status === 401) {
          onLogout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const latest = getLatestPrediction(history);
  const comparisons = summarizeChanges(history);

  useEffect(() => {
    const loadAiFeatures = async () => {
      if (!latest) {
        setRecommendations(null);
        setInsights(null);
        return;
      }

      try {
        setLoadingAi(true);
        setRecommendationsError("");
        setInsightsError("");
        const [recommendationData, insightData] = await Promise.all([
          aiService.recommendations(),
          aiService.insights(),
        ]);
        setRecommendations(recommendationData);
        setInsights(insightData);
      } catch (requestError) {
        const message = requestError.response?.data?.message || "MindPulse AI is unavailable right now.";
        setRecommendationsError(message);
        setInsightsError(message);
        if (requestError.response?.status === 401) {
          onLogout();
          navigate("/login");
        }
      } finally {
        setLoadingAi(false);
      }
    };

    if (!loading) {
      loadAiFeatures();
    }
  }, [loading, latest]);

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      title="Your Burnout Results"
      description="This page gives you the latest signal from your check-ins and highlights how things have shifted since the previous one."
    >
      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 shadow-panel dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Loading your results...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Latest Result</p>
            <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">Current burnout risk</h3>
            {latest ? (
              <>
                <div className="mt-6 flex items-center gap-4">
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${riskBadgeClasses(latest.prediction)}`}>
                    {latest.prediction}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(latest.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-200">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">Stress: {latest.stress_level}/10</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">Sleep: {latest.sleep_hours} hours</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">Social Support: {latest.social_support}/10</div>
                </div>
              </>
            ) : (
              <p className="mt-6 text-sm leading-7 text-slate-500 dark:text-slate-400">
                No saved result yet. Complete a self assessment to see your first burnout summary here.
              </p>
            )}
            {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-700 dark:bg-slate-900 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Last Result Comparison</p>
              <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">What changed since your last check-in?</h3>
              {comparisons.ready ? (
                <div className="mt-6 grid gap-4">
                  {comparisons.items.map((item) => (
                    <div key={item} className="rounded-[24px] bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {comparisons.emptyMessage}
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <AiFeatureCard
              eyebrow="Personalized Recommendations"
              title="What MindPulse suggests next"
              description="These suggestions stay grounded in your latest result and recent patterns, so they feel more like a wellness nudge than generic advice."
              loading={loadingAi}
              error={recommendationsError}
              empty={!latest ? "Complete your first check-in to unlock tailored recommendations." : ""}
            >
              <div className="space-y-4">
                <div className="rounded-[24px] bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {recommendations?.summary}
                </div>
                <div className="grid gap-4">
                  {recommendations?.recommendations?.map((item) => (
                    <div key={item.title} className="rounded-[24px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                      <p className="text-sm font-semibold text-ink dark:text-slate-100">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.why_it_matters}</p>
                      <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {item.next_step}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-800">
                  {recommendations?.encouragement}
                </div>
              </div>
            </AiFeatureCard>

            <AiFeatureCard
              eyebrow="Insight Generator"
              title="What the pattern says"
              description="MindPulse turns your recent check-ins into a short, human-readable insight summary you can actually use."
              loading={loadingAi}
              error={insightsError}
              empty={!latest ? "Your first saved result will unlock AI-generated pattern insights here." : ""}
            >
              <div className="space-y-4">
                <div className="rounded-[24px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                  <p className="text-sm font-semibold text-ink dark:text-slate-100">{insights?.headline}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{insights?.pattern_summary}</p>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-[24px] bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-800">
                    <span className="font-semibold">Encouraging signal:</span> {insights?.encouraging_signal}
                  </div>
                  <div className="rounded-[24px] bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-800">
                    <span className="font-semibold">Watch item:</span> {insights?.watch_item}
                  </div>
                </div>
                <div className="grid gap-3">
                  {insights?.chart_points?.map((item) => (
                    <div key={item.label} className="rounded-[24px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{item.label}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{item.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AiFeatureCard>
          </div>
        </div>
      )}
    </AppShell>
  );
}
