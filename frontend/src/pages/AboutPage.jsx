import { useState } from "react";
import AppShell from "../components/AppShell";

const FEEDBACK_EMAIL = "khusheevashisht.hs.106.prag@gmail.com";
const CREATOR_NAME = "Khushee Vashisht";

export default function AboutPage({ user, onLogout, theme, onToggleTheme }) {
  const [feedback, setFeedback] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "MindPulse Feedback",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFeedback((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const emailBody = encodeURIComponent(
      `Name: ${feedback.name}\nEmail: ${feedback.email}\n\nFeedback:\n${feedback.message}`
    );
    const subject = encodeURIComponent(feedback.subject || "MindPulse Feedback");
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${emailBody}`;
  };

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      title="About MindPulse"
      description="MindPulse was built to make student burnout conversations feel more human, reflective, and useful, while still being backed by a real machine learning workflow."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">About The Project</p>
          <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">Why MindPulse exists</h3>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <p>
              MindPulse is a student burnout prediction system designed to turn a technical ML project into something
              more approachable, supportive, and realistic for student life.
            </p>
            <p>
              Instead of exposing users to raw model features, the project reframes the experience as a guided
              wellbeing check-in focused on stress, anxiety, sleep, support, and change over time.
            </p>
            <p>
              Under the hood, MindPulse brings together a React frontend, Node and Express integration layer, FastAPI
              prediction service, and SQLite persistence into one complete full-stack academic project.
            </p>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Creator Spotlight</p>
          <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">{CREATOR_NAME}</h3>
          <div className="mt-6 rounded-[24px] bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Contact</p>
            <p className="mt-3 break-all text-sm leading-7 text-slate-700 dark:text-slate-200">{FEEDBACK_EMAIL}</p>
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
            MindPulse was created as a polished student project that blends machine learning, full-stack integration,
            and thoughtful UI design into one system that feels practical rather than purely technical.
          </p>
        </section>
      </div>

      <div className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Feedback</p>
        <h3 className="mt-3 font-display text-2xl text-ink dark:text-slate-100">Share your thoughts on MindPulse</h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
          This feedback form opens your default email app and drafts a message directly to {FEEDBACK_EMAIL}, so there
          is no need to change the backend or interfere with the ML services.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink dark:text-slate-100">Your Name</span>
            <input
              type="text"
              name="name"
              value={feedback.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-ember focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-900/40"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink dark:text-slate-100">Your Email</span>
            <input
              type="email"
              name="email"
              value={feedback.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-ember focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-900/40"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink dark:text-slate-100">Subject</span>
            <input
              type="text"
              name="subject"
              value={feedback.subject}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-ember focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-900/40"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink dark:text-slate-100">Message</span>
            <textarea
              name="message"
              value={feedback.message}
              onChange={handleChange}
              rows="6"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:border-ember focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-900/40"
              placeholder="Share what you liked, what you would improve, or how MindPulse felt to use."
              required
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Send Feedback
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
