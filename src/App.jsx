import { useState } from "react";
import Header from "./components/Header";
import Subscription from "./components/Subscription";

// ─── Dummy Data Generator ────────────────────────────────────────────────────
function generateDummyResult(formData) {
  const name = formData.projectName || "the project";
  const stack = formData.techStack || "React, Node.js, PostgreSQL";
  const parts = stack.split(",").map((s) => s.trim());

  return {
    elevatorPitch: `${name} is a production-grade application I built to solve a real-world problem at scale. Using ${stack}, I architected a system that delivers a seamless user experience while maintaining high performance and reliability. The project demonstrates my ability to take an idea from concept to a fully deployed, user-facing product — handling everything from database schema design to UI/UX decisions.`,

    detailedExplanation: `${name} started as a solution to a gap I noticed in existing tools. I began with a thorough requirements analysis, breaking the problem into clearly defined modules.\n\nOn the frontend, I used ${parts[0] || "React"} to build a component-driven UI focused on responsiveness and accessibility. On the backend, I implemented RESTful APIs with authentication, input validation, and error handling.\n\nI set up a CI/CD pipeline to automate testing and deployments, and used environment-based config to manage staging vs production. The result is a scalable, maintainable codebase following industry best practices.`,

    techStackJustification: `Every technology in ${name} was chosen deliberately:\n\n• ${parts[0] || "React"}: Chosen for its component reusability and large ecosystem — it let me move fast while keeping the UI maintainable.\n\n• ${parts[1] || "Node.js"}: Enabled a unified JavaScript codebase, reducing context switching and improving velocity.\n\n• ${parts[2] || "PostgreSQL"}: Selected for its strong ACID guarantees and the relational nature of the data.\n\nI evaluated alternatives for each choice and made tradeoffs based on team expertise, community support, and long-term maintainability.`,

    challengesAndSolutions: `The most significant challenge I faced was: "${formData.challenge}".\n\nMy approach:\n1. I broke the problem down into smaller, testable hypotheses.\n2. I researched existing solutions and patterns used in industry.\n3. I implemented a prototype, measured its performance, and iterated.\n\nThe breakthrough came when I re-evaluated core assumptions before diving deep into implementation. This reduced complexity significantly and unblocked progress. It reinforced the value of stepping back before writing more code.`,

    interviewQA: [
      {
        q: `What was your biggest technical decision in ${name}?`,
        a: `Choosing the right data architecture was critical. I spent time upfront designing the schema and API contracts before writing any business logic. This prevented costly refactors later and kept the team aligned.`,
      },
      {
        q: "How did you ensure code quality and maintainability?",
        a: `I enforced consistent code style with ESLint and Prettier, wrote unit and integration tests for all critical paths, and used PR reviews as learning opportunities. Every feature was developed in a feature branch and merged only after passing CI checks.`,
      },
      {
        q: "How would you scale this if user load 10x'd?",
        a: `I'd identify bottlenecks using APM tooling first. Likely candidates are database query performance and API throughput. I'd introduce read replicas, add Redis caching, and consider extracting high-load services into independently scalable microservices.`,
      },
      {
        q: "What would you do differently if you started over?",
        a: `I'd invest more in observability from day one — structured logging, distributed tracing, and alerting. I added these reactively after a production issue, and doing it proactively would have saved significant debugging time.`,
      },
    ],
  };
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const CopyIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

// ─── ResultCard ──────────────────────────────────────────────────────────────
const CARD_CONFIG = {
  "Elevator Pitch": {
    light: "text-violet-600 bg-violet-50 border-violet-200",
    dark:  "text-violet-400 bg-violet-900/40 border-violet-700",
    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>),
  },
  "Detailed Explanation": {
    light: "text-sky-600 bg-sky-50 border-sky-200",
    dark:  "text-sky-400 bg-sky-900/40 border-sky-700",
    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>),
  },
  "Tech Stack Justification": {
    light: "text-emerald-600 bg-emerald-50 border-emerald-200",
    dark:  "text-emerald-400 bg-emerald-900/40 border-emerald-700",
    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>),
  },
  "Challenges & Solutions": {
    light: "text-amber-600 bg-amber-50 border-amber-200",
    dark:  "text-amber-400 bg-amber-900/40 border-amber-700",
    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>),
  },
  "Interview Q&A": {
    light: "text-rose-600 bg-rose-50 border-rose-200",
    dark:  "text-rose-400 bg-rose-900/40 border-rose-700",
    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>),
  },
};

// Which cards are locked for free users (show only first 2 free)
const FREE_UNLOCKED = ["Elevator Pitch", "Interview Q&A"];
const ALL_CARDS = [
  "Elevator Pitch",
  "Detailed Explanation",
  "Tech Stack Justification",
  "Challenges & Solutions",
  "Interview Q&A",
];

function ResultCard({ title, content, dark, locked, onUpgrade }) {
  const [copied, setCopied] = useState(false);
  const cfg = CARD_CONFIG[title] || { light: "text-stone-600 bg-stone-50 border-stone-200", dark: "text-stone-400 bg-stone-800 border-stone-600", icon: null };
  const iconColor = dark ? cfg.dark : cfg.light;

  const handleCopy = () => {
    const text = Array.isArray(content)
      ? content.map((item) => `Q: ${item.q}\nA: ${item.a}`).join("\n\n")
      : content;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 relative
      ${dark
        ? "bg-stone-900 border-stone-700 hover:border-stone-500"
        : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-md"
      }
      ${locked ? "opacity-80" : ""}
    `}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${iconColor}`}>{cfg.icon}</div>
          <h3 className={`text-sm font-semibold ${dark ? "text-stone-100" : "text-stone-800"}`}>{title}</h3>
          {locked && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
              ${dark ? "bg-amber-900/40 text-amber-400 border border-amber-700" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
              <LockIcon />
              Pro
            </span>
          )}
        </div>
        {!locked && (
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150
              ${copied
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : dark
                  ? "bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700 hover:text-stone-200"
                  : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100 hover:text-stone-700"
              }`}
          >
            {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
          </button>
        )}
      </div>

      {locked ? (
        // Locked overlay
        <div className={`px-5 py-8 flex flex-col items-center justify-center text-center gap-3`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? "bg-stone-800" : "bg-stone-100"}`}>
            <LockIcon />
          </div>
          <div>
            <p className={`text-sm font-semibold ${dark ? "text-stone-300" : "text-stone-600"}`}>Pro feature</p>
            <p className={`text-xs mt-0.5 ${dark ? "text-stone-500" : "text-stone-400"}`}>Upgrade to unlock this section</p>
          </div>
          <button
            onClick={onUpgrade}
            className="mt-1 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors duration-150"
          >
            Upgrade to Pro — ₹149/mo
          </button>
        </div>
      ) : (
        <div className="px-5 py-5">
          {Array.isArray(content) ? (
            <div className="space-y-5">
              {content.map((item, i) => (
                <div key={i}>
                  <p className={`text-sm font-semibold mb-1.5 ${dark ? "text-stone-200" : "text-stone-700"}`}>Q{i + 1}. {item.q}</p>
                  <p className={`text-sm leading-relaxed pl-4 border-l-2 ${dark ? "text-stone-400 border-violet-600" : "text-stone-600 border-violet-200"}`}>{item.a}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm leading-relaxed whitespace-pre-line ${dark ? "text-stone-400" : "text-stone-600"}`}>{content}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonCard({ dark }) {
  return (
    <div className={`border rounded-2xl overflow-hidden animate-pulse ${dark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200"}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${dark ? "bg-stone-800" : "bg-stone-100"}`} />
          <div className={`h-4 w-36 rounded-full ${dark ? "bg-stone-800" : "bg-stone-100"}`} />
        </div>
        <div className={`h-7 w-16 rounded-lg ${dark ? "bg-stone-800" : "bg-stone-100"}`} />
      </div>
      <div className="px-5 py-5 space-y-2.5">
        <div className={`h-3 rounded-full w-full ${dark ? "bg-stone-800" : "bg-stone-100"}`} />
        <div className={`h-3 rounded-full w-5/6 ${dark ? "bg-stone-800" : "bg-stone-100"}`} />
        <div className={`h-3 rounded-full w-4/6 ${dark ? "bg-stone-800" : "bg-stone-100"}`} />
      </div>
    </div>
  );
}

// ─── Credits banner ──────────────────────────────────────────────────────────
function CreditsBanner({ credits, dark, onUpgrade, isPro }) {
  if (isPro) return null;
  return (
    <div className={`mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm
      ${credits > 0
        ? dark ? "bg-violet-900/20 border-violet-800 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-700"
        : dark ? "bg-red-900/20 border-red-800 text-red-300" : "bg-red-50 border-red-200 text-red-600"
      }`}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        {credits > 0
          ? <span><strong>{credits} free generation{credits !== 1 ? "s" : ""}</strong> remaining · Upgrade for unlimited</span>
          : <span><strong>No credits left</strong> · Upgrade to Pro to keep generating</span>
        }
      </div>
      <button
        onClick={onUpgrade}
        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150
          ${credits > 0
            ? "bg-violet-600 text-white hover:bg-violet-700"
            : "bg-red-600 text-white hover:bg-red-700"
          }`}
      >
        Upgrade
      </button>
    </div>
  );
}

// ─── Mock Login Modal ─────────────────────────────────────────────────────────
function LoginModal({ dark, onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl
        ${dark ? "bg-stone-950 border-stone-800" : "bg-white border-stone-200"}`}>
        <h2 className={`text-base font-bold mb-1 ${dark ? "text-stone-50" : "text-stone-900"}`}>Sign in to continue</h2>
        <p className={`text-xs mb-5 ${dark ? "text-stone-500" : "text-stone-400"}`}>
          Create a free account to get 3 generations.
        </p>
        {/* Mock Google login */}
        <button
          onClick={() => onLogin({ name: "Rahul Sharma", email: "rahul@gmail.com", isPro: false })}
          className={`w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 mb-3
            ${dark ? "border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <button
          onClick={() => onLogin({ name: "Demo User", email: "demo@example.com", isPro: true })}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Try as Pro (demo)
        </button>
        <p className={`text-xs text-center mt-4 ${dark ? "text-stone-600" : "text-stone-400"}`}>
          By signing in you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
const FREE_CREDITS = 3;

export default function App() {
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(FREE_CREDITS);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [form, setForm] = useState({
    projectName: "", techStack: "", description: "", contribution: "", challenge: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const isValid = Object.values(form).every((v) => v.trim() !== "");
  const isPro = user?.isPro === true;
  const canGenerate = isPro || credits > 0;

  const handleGenerate = () => {
    if (!isValid || loading) return;
    if (!user) { setShowLogin(true); return; }
    if (!canGenerate) { setShowSubscription(true); return; }

    setLoading(true);
    setResult(null);
    if (!isPro) setCredits((c) => c - 1);
    setTimeout(() => {
      setResult(generateDummyResult(form));
      setLoading(false);
    }, 2200);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    if (userData.isPro) setCredits(Infinity);
  };

  const handleLogout = () => {
    setUser(null);
    setCredits(FREE_CREDITS);
    setResult(null);
  };

  const handleSelectPlan = (planId) => {
    // Hook up Razorpay here
    alert(`Razorpay integration: selected plan "${planId}". Hook up payment here.`);
    setShowSubscription(false);
  };

  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-150 resize-none leading-relaxed
    ${dark
      ? "bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 hover:border-stone-600"
      : "bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 hover:border-stone-300"
    }`;
  const labelCls = `text-xs font-semibold uppercase tracking-wide ${dark ? "text-stone-400" : "text-stone-500"}`;

  const generateBtnLabel = !user
    ? "Sign in to Generate"
    : !canGenerate
      ? "No Credits — Upgrade to Pro"
      : loading
        ? "Generating..."
        : "Generate Explanation";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-stone-950" : "bg-[#fafaf9]"}`}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl transition-colors duration-300 ${dark ? "bg-violet-900/20" : "bg-violet-100/60"}`} />
        <div className={`absolute top-1/2 -left-32 w-80 h-80 rounded-full blur-3xl transition-colors duration-300 ${dark ? "bg-sky-900/20" : "bg-sky-100/50"}`} />
        <div className={`absolute bottom-0 right-1/3 w-64 h-64 rounded-full blur-3xl transition-colors duration-300 ${dark ? "bg-amber-900/10" : "bg-amber-50/70"}`} />
      </div>

      {/* Header */}
      <Header
        dark={dark}
        setDark={setDark}
        user={user}
        onLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
        credits={isPro ? null : credits}
        onSubscribe={() => setShowSubscription(true)}
      />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className={`inline-flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-full mb-5
            ${dark ? "bg-violet-900/30 border-violet-700 text-violet-400" : "bg-violet-50 border-violet-200/70 text-violet-700"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            AI-powered · For job seekers & developers
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 ${dark ? "text-stone-50" : "text-stone-900"}`}>
            Explain Your Project<br />
            <span className="text-violet-500">Like a Pro</span>
          </h1>
          <p className={`text-base max-w-md mx-auto leading-relaxed ${dark ? "text-stone-400" : "text-stone-500"}`}>
            Turn your project into interview-ready answers in seconds.
          </p>
        </div>

        {/* Credits banner */}
        {user && (
          <CreditsBanner
            credits={isPro ? Infinity : credits}
            dark={dark}
            onUpgrade={() => setShowSubscription(true)}
            isPro={isPro}
          />
        )}

        {/* Form Card */}
        <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300
          ${dark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"}`}>
          <div className={`px-6 sm:px-8 pt-6 pb-3 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
            <h2 className={`text-xs font-semibold uppercase tracking-widest ${dark ? "text-stone-500" : "text-stone-400"}`}>
              Project Details
            </h2>
          </div>
          <div className="px-6 sm:px-8 py-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Project Name</label>
                <input className={inputCls} placeholder="e.g. CollabFlow Dashboard" value={form.projectName} onChange={set("projectName")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Tech Stack</label>
                <input className={inputCls} placeholder="e.g. React, Node.js, PostgreSQL" value={form.techStack} onChange={set("techStack")} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Project Description</label>
              <textarea rows={3} className={inputCls} placeholder="What does it do? Who is it for? What problem does it solve?" value={form.description} onChange={set("description")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Your Contribution</label>
              <textarea rows={3} className={inputCls} placeholder="What was your specific role? What features or systems did you own?" value={form.contribution} onChange={set("contribution")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Biggest Challenge</label>
              <textarea rows={3} className={inputCls} placeholder="What was the hardest problem you faced? How did you solve it?" value={form.challenge} onChange={set("challenge")} />
            </div>
            <div className={`border-t pt-1 ${dark ? "border-stone-800" : "border-stone-100"}`} />
            <button
              onClick={handleGenerate}
              disabled={loading || (!isPro && !canGenerate && user)}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none
                ${(loading || (!isPro && !canGenerate && user))
                  ? dark ? "bg-stone-800 text-stone-600 cursor-not-allowed" : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : !user || !isValid
                    ? dark ? "bg-stone-800 text-stone-500 hover:bg-stone-700 hover:text-stone-300 border border-stone-700" : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700 border border-stone-200"
                    : "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.99] shadow-md shadow-violet-900/30"
                }`}
            >
              {loading && <SpinnerIcon />}
              {generateBtnLabel}
            </button>
            {!isValid && user && (
              <p className={`text-center text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>
                Fill in all fields to unlock generation
              </p>
            )}
            {!user && (
              <p className={`text-center text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>
                Free plan includes <strong className={dark ? "text-stone-400" : "text-stone-600"}>3 generations</strong> — no credit card needed
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {(loading || result) && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <div className={`h-px flex-1 ${dark ? "bg-stone-800" : "bg-stone-200"}`} />
              <span className={`text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${dark ? "text-stone-600" : "text-stone-400"}`}>
                {loading ? "Generating..." : "Your Results"}
              </span>
              <div className={`h-px flex-1 ${dark ? "bg-stone-800" : "bg-stone-200"}`} />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[0,1,2,3,4].map((i) => <SkeletonCard key={i} dark={dark} />)}
              </div>
            ) : result ? (
              <div className="space-y-4" style={{ animation: "fadeUp 0.4s ease-out" }}>
                <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <div className="flex justify-center mb-2">
                  <span className={`inline-flex items-center gap-2 border text-xs font-medium px-3.5 py-1.5 rounded-full
                    ${dark ? "bg-emerald-900/30 border-emerald-700 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    <CheckIcon /> Ready to use in your interviews
                  </span>
                </div>
                {ALL_CARDS.map((title) => {
                  const locked = !isPro && !FREE_UNLOCKED.includes(title);
                  const contentMap = {
                    "Elevator Pitch": result.elevatorPitch,
                    "Detailed Explanation": result.detailedExplanation,
                    "Tech Stack Justification": result.techStackJustification,
                    "Challenges & Solutions": result.challengesAndSolutions,
                    "Interview Q&A": result.interviewQA,
                  };
                  return (
                    <ResultCard
                      key={title}
                      title={title}
                      content={contentMap[title]}
                      dark={dark}
                      locked={locked}
                      onUpgrade={() => setShowSubscription(true)}
                    />
                  );
                })}
                {!isPro && (
                  <div className={`rounded-2xl border p-5 text-center transition-colors duration-300
                    ${dark ? "bg-violet-950/40 border-violet-800" : "bg-violet-50 border-violet-200"}`}>
                    <p className={`text-sm font-semibold mb-1 ${dark ? "text-violet-300" : "text-violet-700"}`}>
                      Unlock 3 more sections with Pro
                    </p>
                    <p className={`text-xs mb-3 ${dark ? "text-stone-500" : "text-stone-400"}`}>
                      Detailed Explanation, Tech Stack Justification, Challenges & Solutions + unlimited generations
                    </p>
                    <button
                      onClick={() => setShowSubscription(true)}
                      className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors duration-150 shadow-md shadow-violet-900/30"
                    >
                      Upgrade to Pro — ₹149/mo
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </main>

      <footer className={`relative z-10 border-t mt-16 transition-colors duration-300 ${dark ? "border-stone-800" : "border-stone-200/80"}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <span className={`text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>© 2025 ExplainMyProject</span>
          <span className={`text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>Built for engineers, by engineers</span>
        </div>
      </footer>

      {/* Modals */}
      {showSubscription && (
        <Subscription
          dark={dark}
          onClose={() => setShowSubscription(false)}
          onSelectPlan={handleSelectPlan}
          currentPlan={isPro ? "pro_monthly" : "free"}
        />
      )}
      {showLogin && (
        <LoginModal
          dark={dark}
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}