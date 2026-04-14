import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import HistoryTable from "../components/HistoryTable";
import { predictionService } from "../services/api";

export default function HistoryPage({ user, onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await predictionService.history();
        setHistory(data.predictions || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load your check-ins.");
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

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      title="Your Past Check-ins"
      description="Review earlier check-ins in one place and notice patterns in stress, sleep, and support over time."
    >
      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 shadow-panel dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Loading your past check-ins...
        </div>
      ) : (
        <>
          {error ? <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
          <HistoryTable predictions={history} />
        </>
      )}
    </AppShell>
  );
}
