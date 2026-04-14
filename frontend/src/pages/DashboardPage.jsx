import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import AiFeatureCard from "../components/AiFeatureCard";
import { aiService, predictionService } from "../services/api";
import { getLatestPrediction, summarizeChanges } from "../utils/insights";
import assessmentArt from "../assets/card-assessment.svg";
import resultsArt from "../assets/card-results.svg";
import historyArt from "../assets/card-history.svg";

export default function DashboardPage({ user, onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsError, setInsightsError] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await predictionService.history();
      setHistory(data.predictions || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load prediction history.");
      if (requestError.response?.status === 401) {
        onLogout();
        navigate("/login");
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const latest = getLatestPrediction(history);
  const comparisons = summarizeChanges(history);
  const recentHistory = history.slice(0, 3);

  useEffect(() => {
    const loadInsights = async () => {
      if (!latest) {
        setInsights(null);
        return;
      }

      try {
        setLoadingInsights(true);
        setInsightsError("");
        const data = await aiService.insights();
        setInsights(data);
      } catch (requestError) {
        setInsightsError(requestError.response?.data?.message || "MindPulse AI snapshot is unavailable right now.");
        if (requestError.response?.status === 401) {
          onLogout();
          navigate("/login");
        }
      } finally {
        setLoadingInsights(false);
      }
    };

    if (!loadingHistory) {
      loadInsights();
    }
  }, [loadingHistory, latest]);

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      title={`Welcome, ${user?.name || "Student"}`}
      description="Your dashboard is now a quick snapshot. Use the cards below to jump into the full self assessment, detailed results, or your past check-ins."
    >
      {error ? <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Link
          to="/dashboard/assessment"
          className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-panel transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex justify-center bg-[linear-gradient(180deg,_rgba(27,39,71,0.03),_rgba(221,122,18,0.02))] px-6 pt-6">
            <img src={assessmentArt} alt="" className="h-28 w-auto object-contain" />
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Self Assessment</p>
            <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">Start a new check-in</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Answer the guided slider questions and get a new burnout result without digging through the whole dashboard.
            </p>
          </div>
        </Link>

        <Link
          to="/dashboard/results"
          className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-panel transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex justify-center bg-[linear-gradient(180deg,_rgba(27,39,71,0.03),_rgba(221,122,18,0.02))] px-6 pt-6">
            <img src={resultsArt} alt="" className="h-28 w-auto object-contain" />
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Your Burnout Results</p>
            <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">{latest?.prediction || "No result yet"}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              See your latest outcome and a human-friendly comparison with the previous check-in.
            </p>
          </div>
        </Link>

        <Link
          to="/dashboard/history"
          className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-panel transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex justify-center bg-[linear-gradient(180deg,_rgba(27,39,71,0.03),_rgba(221,122,18,0.02))] px-6 pt-6">
            <img src={historyArt} alt="" className="h-28 w-auto object-contain" />
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Your Past Check-ins</p>
            <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">{history.length} saved entries</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Review the dates, risk levels, and key signals from your earlier check-ins in one dedicated place.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Last Result Comparison</p>
            <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">What changed since the last check?</h3>
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

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Snapshot</p>
          <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">Your recent activity</h3>
          {loadingHistory ? (
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading your recent check-ins...</p>
          ) : recentHistory.length > 0 ? (
            <div className="mt-6 space-y-3">
              {recentHistory.map((item) => (
                <div key={item.id} className="rounded-[24px] bg-slate-50 px-5 py-4 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-ink dark:text-slate-100">{item.prediction}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Stress {item.stress_level}/10, Sleep {item.sleep_hours}h, Support {item.social_support}/10
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm leading-7 text-slate-500 dark:text-slate-400">
              No check-ins yet. Start with the self assessment card above to create your first result.
            </p>
          )}
        </section>
      </div>

      <div className="mt-6">
        <AiFeatureCard
          eyebrow="Insight Generator"
          title="AI snapshot"
          description="A gentle, generated summary of the pattern inside your recent check-ins."
          loading={loadingInsights}
          error={insightsError}
          empty={!latest ? "Your first saved check-in will unlock an AI summary here." : ""}
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
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
          </div>
        </AiFeatureCard>
      </div>
    </AppShell>
  );
}
