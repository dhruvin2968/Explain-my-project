import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const BoltIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

// ─── Match Ring ───────────────────────────────────────────────────────────────
function MatchRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? "#10b981"
    : score >= 50 ? "#f59e0b"
    : "#ef4444";

  const label = score >= 75 ? "Strong Match"
    : score >= 50 ? "Partial Match"
    : "Weak Match";

  const bgColor = score >= 75 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
    : score >= 50 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";

  return (
    <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl border ${bgColor}`}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor"
          strokeWidth="8" className="text-stone-200 dark:text-stone-700" />
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text x="64" y="58" textAnchor="middle" fontSize="28" fontWeight="800" fill={color}>
          {score}%
        </text>
        <text x="64" y="76" textAnchor="middle" fontSize="11" fill={color} opacity="0.8">
          match
        </text>
      </svg>
      <span style={{ color }} className="text-sm font-bold">{label}</span>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, score, color, dark }) {
  const colorMap = {
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-medium ${dark ? "text-stone-400" : "text-stone-600"}`}>{label}</span>
        <span className={`text-xs font-bold ${dark ? "text-stone-300" : "text-stone-700"}`}>{score}/100</span>
      </div>
      <div className={`h-2 rounded-full ${dark ? "bg-stone-800" : "bg-stone-100"}`}>
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${colorMap[color]}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Skill Tag ────────────────────────────────────────────────────────────────
function SkillTag({ label, matched, dark }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border
      ${matched
        ? dark
          ? "bg-emerald-900/30 border-emerald-700 text-emerald-400"
          : "bg-emerald-50 border-emerald-200 text-emerald-700"
        : dark
          ? "bg-red-900/20 border-red-800 text-red-400"
          : "bg-red-50 border-red-200 text-red-600"
      }`}>
      {matched ? <CheckIcon /> : <AlertIcon />}
      {label}
    </span>
  );
}

// ─── Prep Task Card ───────────────────────────────────────────────────────────
function PrepCard({ task, index, dark }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border
      ${dark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200"}`}>
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
        ${dark ? "bg-purple-900/50 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${dark ? "text-stone-200" : "text-stone-700"}`}>{task.topic}</p>
        <p className={`text-xs mt-0.5 ${dark ? "text-stone-500" : "text-stone-400"}`}>{task.reason}</p>
      </div>
      <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-lg
        ${dark ? "bg-stone-800 text-stone-400" : "bg-stone-100 text-stone-500"}`}>
        ~{task.hours}h
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobMatch({ dark, setDark, user, onLogin, onLogout, credits, onSubscribe }) {
  const [resume, setResume]   = useState("");
  const [jd, setJd]           = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  const isValid = resume.trim().length > 100 && jd.trim().length > 50;

  const handleMatch = async () => {
    if (!isValid || loading) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/job-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resume, jobDescription: jd }),
      });

      if (!res.ok) throw new Error("Server error. Please try again.");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const textareaCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-150 resize-none leading-relaxed font-mono
    ${dark
      ? "bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
      : "bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
    }`;

  const labelCls = `text-xs font-semibold uppercase tracking-wide ${dark ? "text-stone-400" : "text-stone-500"}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-stone-950" : "bg-[#fafaf9]"}`}>

      {/* Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${dark ? "bg-purple-900/20" : "bg-purple-100/60"}`} />
        <div className={`absolute bottom-0 -left-32 w-80 h-80 rounded-full blur-3xl ${dark ? "bg-sky-900/20" : "bg-sky-100/50"}`} />
      </div>

      <Header
        dark={dark} setDark={setDark}
        user={user} onLogin={onLogin} onLogout={onLogout}
        credits={credits} onSubscribe={onSubscribe}
      />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className={`inline-flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-full mb-5
            ${dark ? "bg-purple-900/30 border-purple-700 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-700"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            AI-powered · Know your odds before you apply
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 ${dark ? "text-stone-50" : "text-stone-900"}`}>
            Job Match Score<br />
            <span className="text-purple-500">Know before you apply.</span>
          </h1>
          <p className={`text-base max-w-md mx-auto leading-relaxed ${dark ? "text-stone-400" : "text-stone-500"}`}>
            Paste your resume and the job description. Get a match score, skill gaps, and a custom prep plan in seconds.
          </p>
        </div>

        {/* Input Card */}
        <div className={`border rounded-2xl shadow-sm overflow-hidden mb-6
          ${dark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"}`}>
          <div className={`px-6 sm:px-8 pt-6 pb-3 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
            <h2 className={`text-xs font-semibold uppercase tracking-widest ${dark ? "text-stone-500" : "text-stone-400"}`}>
              Match Details
            </h2>
          </div>
          <div className="px-6 sm:px-8 py-6 space-y-5">

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Your Resume <span className="normal-case font-normal">(paste plain text)</span></label>
              <textarea
                rows={8}
                className={textareaCls}
                placeholder="Paste your resume text here..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
              <span className={`text-xs text-right ${dark ? "text-stone-600" : "text-stone-400"}`}>
                {resume.length} chars {resume.length < 100 && resume.length > 0 && "· too short"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Job Description <span className="normal-case font-normal">(paste full JD)</span></label>
              <textarea
                rows={8}
                className={textareaCls}
                placeholder="Paste the job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>

            {error && (
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm
                ${dark ? "bg-red-900/20 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}>
                <AlertIcon /> {error}
              </div>
            )}

            <button
              onClick={handleMatch}
              disabled={!isValid || loading}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${!isValid || loading
                  ? dark ? "bg-stone-800 text-stone-600 cursor-not-allowed" : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.99] shadow-md shadow-purple-900/30"
                }`}
            >
              {loading && <SpinnerIcon />}
              {loading ? "Analyzing match..." : "Check Job Match →"}
            </button>

            {!isValid && (
              <p className={`text-center text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>
                Paste both your resume and the job description to continue
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {(loading || result) && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.4s ease-out" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <div className="flex items-center gap-3">
              <div className={`h-px flex-1 ${dark ? "bg-stone-800" : "bg-stone-200"}`} />
              <span className={`text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${dark ? "text-stone-600" : "text-stone-400"}`}>
                {loading ? "Analyzing..." : "Your Results"}
              </span>
              <div className={`h-px flex-1 ${dark ? "bg-stone-800" : "bg-stone-200"}`} />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className={`h-24 rounded-2xl animate-pulse ${dark ? "bg-stone-900" : "bg-white border border-stone-200"}`} />
                ))}
              </div>
            ) : result && (
              <>
                {/* Match ring + score bars */}
                <div className={`border rounded-2xl p-6 ${dark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                    <div className="flex justify-center">
                      <MatchRing score={result.overallMatch} />
                    </div>
                    <div className="space-y-4">
                      <ScoreBar label="Skills Match"       score={result.skillsMatch}      color="violet" dark={dark} />
                      <ScoreBar label="Experience Match"   score={result.experienceMatch}  color="sky"    dark={dark} />
                      <ScoreBar label="Keyword Coverage"   score={result.keywordCoverage}  color="emerald" dark={dark} />
                      <ScoreBar label="Role Alignment"     score={result.roleAlignment}    color="amber"  dark={dark} />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className={`border rounded-2xl p-5 ${dark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <BoltIcon />
                      <h3 className={`text-sm font-semibold ${dark ? "text-stone-100" : "text-stone-800"}`}>
                        AI Assessment
                      </h3>
                    </div>
                    <p className={`text-sm leading-relaxed ${dark ? "text-stone-400" : "text-stone-600"}`}>
                      {result.summary}
                    </p>
                  </div>
                )}

                {/* Matched + Missing Skills */}
                {(result.matchedSkills?.length > 0 || result.missingSkills?.length > 0) && (
                  <div className={`border rounded-2xl p-5 ${dark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200"}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${dark ? "text-stone-100" : "text-stone-800"}`}>
                      Skill Breakdown
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills?.map((s, i) => (
                        <SkillTag key={`m-${i}`} label={s} matched={true} dark={dark} />
                      ))}
                      {result.missingSkills?.map((s, i) => (
                        <SkillTag key={`g-${i}`} label={s} matched={false} dark={dark} />
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`text-xs ${dark ? "text-stone-500" : "text-stone-400"}`}>
                        <span className="text-emerald-500 font-semibold">✓</span> You have · <span className="text-red-500 font-semibold">✗</span> Missing
                      </span>
                    </div>
                  </div>
                )}

                {/* Prep Plan */}
                {result.prepPlan?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookIcon />
                      <h3 className={`text-sm font-semibold ${dark ? "text-stone-100" : "text-stone-800"}`}>
                        Your Prep Plan
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${dark ? "bg-purple-900/40 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
                        {result.prepPlan.length} topics · ~{result.prepPlan.reduce((a, t) => a + (t.hours || 2), 0)}h total
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {result.prepPlan.map((task, i) => (
                        <PrepCard key={i} task={task} index={i} dark={dark} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Done */}
                <div className="flex justify-center">
                  <span className={`inline-flex items-center gap-2 border text-xs font-medium px-3.5 py-1.5 rounded-full
                    ${dark ? "bg-emerald-900/30 border-emerald-700 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    <CheckIcon /> Analysis complete · Fix the gaps before applying
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Footer dark={dark} />
    </div>
  );
}