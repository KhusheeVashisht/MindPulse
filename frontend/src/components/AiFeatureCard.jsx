export default function AiFeatureCard({
  eyebrow,
  title,
  description,
  loading,
  error,
  empty,
  alwaysShowChildren = false,
  children,
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel transition-colors dark:border-slate-700 dark:bg-slate-900 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">{eyebrow}</p>
      <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">{title}</h3>
      {description ? <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p> : null}
      {loading ? <div className="mt-6 rounded-[24px] bg-slate-50 px-5 py-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">Thinking through your check-ins...</div> : null}
      {!loading && error ? <div className="mt-6 rounded-[24px] bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">{error}</div> : null}
      {!loading && !error && empty ? <div className="mt-6 rounded-[24px] bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{empty}</div> : null}
      {!loading && !error && (alwaysShowChildren || !empty) ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
