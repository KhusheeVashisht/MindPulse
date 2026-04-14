import { useState } from "react";
import { NavLink } from "react-router-dom";
import headerArt from "../assets/page-header-illustration.svg";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dashboard/assessment", label: "Self Assessment" },
  { to: "/dashboard/results", label: "Results" },
  { to: "/dashboard/history", label: "Past Check-ins" },
  { to: "/dashboard/about", label: "About MindPulse" },
];

export default function AppShell({ user, onLogout, title, description, children, theme, onToggleTheme }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(252,250,246,0.95),_rgba(245,239,228,0.95))] transition-colors dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(17,24,39,0.98))]">
      {isNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[1px]"
          onClick={() => setIsNavOpen(false)}
        />
      ) : null}

      <div className="mx-auto min-h-screen max-w-[1600px]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col justify-between overflow-y-auto overscroll-contain bg-ink px-6 py-8 text-white shadow-2xl transition-transform duration-300 dark:bg-slate-950 lg:w-[320px] lg:px-8 ${
            isNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="font-display text-sm uppercase tracking-[0.35em] text-white/65">MindPulse</p>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsNavOpen(false)}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <h1 className="mt-6 font-display text-3xl leading-tight">Student Burnout Prediction System</h1>
            <p className="mt-4 text-sm leading-7 text-white/70">
              A calmer space to check in on wellbeing, reflect on recent pressure, and review earlier patterns over time.
            </p>

            <nav className="mt-10 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/15"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-10 rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-white/55">Signed in as</p>
              <p className="mt-3 break-words text-xl font-semibold leading-tight">{user?.name}</p>
              <p className="mt-1 break-all text-sm leading-6 text-white/70">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-8 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Logout
          </button>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setIsNavOpen((current) => !current)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-ink shadow-panel transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <span className="flex flex-col gap-1.5">
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-panel transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel transition-colors dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">MindPulse</p>
                <h2 className="mt-2 font-display text-3xl text-ink dark:text-slate-100">{title}</h2>
                <p className="mx-auto mt-2 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
              </div>
              <div className="flex justify-center">
                <img
                  src={headerArt}
                  alt="Gentle MindPulse header illustration"
                  className="h-auto w-full max-w-[360px] rounded-[28px]"
                />
              </div>
            </div>
          </section>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
