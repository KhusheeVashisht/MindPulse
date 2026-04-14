function formatDate(timestamp) {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function riskBadgeClasses(risk) {
  if (risk === "Low") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (risk === "High") {
    return "bg-red-50 text-red-700";
  }
  return "bg-amber-50 text-amber-700";
}

export default function HistoryTable({ predictions }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-panel transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <h3 className="font-display text-xl text-ink dark:text-slate-100">Your Past Check-ins</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A simple view of earlier check-ins, with the signals that mattered most.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Burnout Risk</th>
              <th className="px-6 py-4 font-semibold">Key Indicators</th>
            </tr>
          </thead>
          <tbody>
            {predictions.length > 0 ? (
              predictions.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-200">{formatDate(item.timestamp)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskBadgeClasses(item.prediction || item.risk_level)}`}>
                      {item.prediction || item.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-200">
                    Stress {item.stress_level}/10, Sleep {item.sleep_hours}h, Support {item.social_support}/10
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                  No check-ins yet. Complete the self assessment to start building your wellness history.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
