export default function AuthLayout({ title, subtitle, children, footer, theme, onToggleTheme }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-panel transition-colors dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[620px] overflow-hidden bg-ink px-10 py-12 text-white lg:block dark:bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,167,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(244,182,168,0.28),_transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.35em] text-white/70">MindPulse</p>
              <h1 className="mt-6 max-w-sm font-display text-4xl leading-tight">
                Spot burnout signals before they become bigger setbacks.
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/75">
                A student-focused wellbeing dashboard that blends structured self-reporting with machine learning
                insights in one calm, modern workspace.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-sm font-semibold text-mint">A relatable check-in</p>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  Late nights, exam pressure, too much screen time, not enough support. If that sounds familiar,
                  MindPulse was built for this exact student reality.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <p className="text-sm font-semibold text-mint">What you can do here</p>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  Register securely, run a burnout prediction, compare recent changes, and review your personal
                  check-in history over time.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between gap-4">
              <p className="font-display text-sm uppercase tracking-[0.3em] text-ember">MindPulse</p>
              <button
                type="button"
                onClick={onToggleTheme}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
            <h2 className="mt-5 font-display text-3xl text-ink dark:text-slate-100">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
