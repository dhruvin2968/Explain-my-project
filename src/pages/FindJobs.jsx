import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Firestore helpers (same pattern as ExplainMyProject) ────────────────────
async function getUserData(fbUser) {
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  // First visit — create doc with free plan
  await setDoc(ref, {
    name: fbUser.displayName,
    email: fbUser.email,
    plan: "free",
    credits: 5,
    createdAt: new Date().toISOString(),
  });
  return { plan: "free", credits: 5 };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const ExternalIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.375A2.25 2.25 0 015.25 4.125h4.5M20.25 14.15l-7.5 1.275M20.25 14.15L12.75 12M9.75 4.125V3m0 1.125h4.5M9.75 4.125c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, dark }) {
  const posted = new Date(job.publication_date);
  const daysAgo = Math.floor((Date.now() - posted) / 86400000);
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <div
      className="rounded-2xl border p-5 transition-all duration-150 hover:border-[#F5A623]/50 group"
      style={{ background: dark ? "#0d0d0d" : "#ffffff", borderColor: dark ? "#1a1a1a" : "#e5e5e5" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {job.company_logo_url ? (
            <img
              src={job.company_logo_url}
              alt={job.company_name}
              className="w-10 h-10 rounded-xl object-contain flex-shrink-0 border"
              style={{ borderColor: dark ? "#222" : "#e5e5e5", background: dark ? "#111" : "#f9f9f9" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: dark ? "#1a1a1a" : "#f0f0f0" }}>
              <BriefcaseIcon />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate" style={{ color: dark ? "#f0f0f0" : "#0a0a0a" }}>
              {job.title}
            </h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: dark ? "#666" : "#888" }}>
              {job.company_name}
            </p>
          </div>
        </div>

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
          style={{ background: "#F5A623", color: "#000" }}
        >
          Apply <ExternalIcon />
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {job.candidate_required_location && (
          <span className="flex items-center gap-1 text-xs" style={{ color: dark ? "#555" : "#aaa" }}>
            <MapPinIcon /> {job.candidate_required_location}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs" style={{ color: dark ? "#555" : "#aaa" }}>
          <ClockIcon /> {timeLabel}
        </span>
        {job.job_type && (
          <span className="text-xs px-2 py-0.5 rounded-full border"
            style={{ borderColor: dark ? "#2a2a2a" : "#e5e5e5", color: dark ? "#888" : "#666" }}>
            {job.job_type.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {job.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {job.tags.slice(0, 5).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: dark ? "#111" : "#f5f5f0", color: dark ? "#888" : "#666" }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pro Gate ─────────────────────────────────────────────────────────────────
function ProGate({ dark, user, onLogin, onSubscribe }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: dark ? "rgba(245,166,35,0.1)" : "rgba(245,166,35,0.12)", color: "#F5A623" }}>
        <LockIcon />
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: dark ? "#f0f0f0" : "#0a0a0a", fontFamily: "'Syne', sans-serif" }}>
        Pro feature
      </h2>
      <p className="text-sm max-w-xs mb-6" style={{ color: dark ? "#666" : "#888" }}>
        {!user
          ? "Sign in and upgrade to Pro to access job search powered by live listings."
          : "Upgrade to Pro to unlock real-time job listings tailored to your profile."}
      </p>
      {!user ? (
        <button
          onClick={onLogin}
          className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg"
          style={{ background: "#F5A623", color: "#000" }}
        >
          Sign in to continue
        </button>
      ) : (
        <button
          onClick={onSubscribe}
          className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg"
          style={{ background: "#F5A623", color: "#000" }}
        >
          Upgrade to Pro →
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All", "Software Development", "DevOps", "Data", "Design", "Product", "Marketing", "Finance",
];

export default function FindJobs({ dark, onLogin, onSubscribe }) {
  // ── Auth + Firestore plan check (same pattern as ExplainMyProject) ──────────
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData]         = useState(null);
  const [authLoading, setAuthLoading]   = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const data = await getUserData(fbUser);
        setUserData(data);
      } else {
        setFirebaseUser(null);
        setUserData(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const isPro = userData?.plan && userData.plan !== "free";

  // ── Search state ────────────────────────────────────────────────────────────
  const [source, setSource] = useState("remote"); // "remote" | "india"
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("Any");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (loading) return;
    setError("");
    setJobs([]);
    setLoading(true);
    setSearched(true);

    try {
      if (source === "remote") {
        const params = new URLSearchParams({ limit: "20" });
        if (query.trim()) params.set("search", query.trim());
        if (category !== "All") params.set("category", category);
        const res = await fetch(`https://remotive.com/api/remote-jobs?${params}`);
        if (!res.ok) throw new Error("Failed to fetch jobs. Please try again.");
        const data = await res.json();
        setJobs(data.jobs || []);
      } else {
        // India jobs — proxied through backend (key stays server-side)
        const token = firebaseUser ? await firebaseUser.getIdToken() : null;
        const params = new URLSearchParams({ page: "1" });
        if (query.trim()) params.set("query", query.trim());
        if (location !== "Any") params.set("location", location);
        const res = await fetch(`${API_URL}/jobs/india?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch India jobs.");
        }
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, category, location, loading, source, firebaseUser]);

  const textMain = dark ? "#f0f0f0" : "#0a0a0a";
  const textSub = dark ? "#666" : "#888";
  const border = dark ? "#1a1a1a" : "#e5e5e5";
  const cardBg = dark ? "#0d0d0d" : "#ffffff";

  // Auth loading screen
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#050505" : "#f5f5f0" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse" style={{ background: "#F5A623" }}>
            <BriefcaseIcon />
          </div>
          <p className="text-xs" style={{ color: dark ? "#555" : "#aaa" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: dark ? "#050505" : "#f5f5f0", transition: "background 0.3s" }}>

      {/* Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", top: "-10rem", right: "-10rem", width: "24rem", height: "24rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(245,166,35,0.06)" : "rgba(245,166,35,0.1)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "-8rem", width: "20rem", height: "20rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(14,165,233,0.05)" : "rgba(14,165,233,0.08)" }} />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-full mb-5"
            style={{ background: dark ? "rgba(245,166,35,0.1)" : "rgba(245,166,35,0.12)", borderColor: dark ? "rgba(245,166,35,0.35)" : "rgba(245,166,35,0.4)", color: "#F5A623" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#F5A623" }} />
            Pro · Live remote job listings
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 ${dark ? "text-stone-50" : "text-stone-900"}`}
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Find Jobs<br />
            <span style={{ color: "#F5A623" }}>Built for developers.</span>
          </h1>
          <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: textSub }}>
            Search thousands of remote tech jobs. Filter by role or category and apply directly.
          </p>
        </div>

        {/* Source Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: "remote", label: "Remote (Global)", emoji: "🌐", pro: false },
            { id: "india", label: "India Jobs", emoji: "🇮🇳", pro: true },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSource(tab.id);
                setJobs([]);
                setSearched(false);
                setError("");
              }}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border transition-all"
              style={source === tab.id
                ? { background: "#F5A623", color: "#000", borderColor: "#F5A623" }
                : { background: dark ? "#0d0d0d" : "#fff", color: dark ? "#888" : "#666", borderColor: dark ? "#1a1a1a" : "#e5e5e5" }
              }
            >
              <span>{tab.emoji}</span>
              {tab.label}
              {tab.pro && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: source === tab.id ? "rgba(0,0,0,0.2)" : "#F5A623",
                    color: source === tab.id ? "#000" : "#000",
                  }}>
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>

        {/* India tab — Pro gate */}
        {source === "india" && !isPro ? (
          <ProGate dark={dark} user={firebaseUser} onLogin={onLogin} onSubscribe={onSubscribe} />
        ) : (
          <>
            {/* Search bar */}
            <div className="rounded-2xl border overflow-hidden mb-6"
              style={{ background: cardBg, borderColor: border }}>
              <div className="px-6 sm:px-8 pt-6 pb-3 border-b" style={{ borderColor: border }}>
                <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: dark ? "#555" : "#999" }}>
                  Search
                </h2>
              </div>
              <div className="px-6 sm:px-8 py-5 space-y-4">

                {/* Keyword */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: dark ? "#555" : "#aaa" }}>
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. React developer, Python engineer…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition-all duration-150"
                    style={{
                      background: dark ? "#111" : "#f9f9f7",
                      borderColor: dark ? "#222" : "#e5e5e5",
                      color: dark ? "#f0f0f0" : "#0a0a0a",
                    }}
                  />
                </div>

                {/* Category pills (Remote) / Location chips (India) */}
                {source === "remote" ? (
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150"
                        style={category === cat
                          ? { background: "#F5A623", color: "#000", borderColor: "#F5A623" }
                          : { background: "transparent", color: dark ? "#666" : "#888", borderColor: dark ? "#2a2a2a" : "#e5e5e5" }
                        }
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {["Any", "Bangalore", "Mumbai", "Hyderabad", "Delhi NCR", "Pune", "Chennai", "Remote"].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150"
                        style={location === loc
                          ? { background: "#F5A623", color: "#000", borderColor: "#F5A623" }
                          : { background: "transparent", color: dark ? "#666" : "#888", borderColor: dark ? "#2a2a2a" : "#e5e5e5" }
                        }
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm"
                    style={{ background: dark ? "rgba(239,68,68,0.1)" : "#fef2f2", borderColor: dark ? "#7f1d1d" : "#fecaca", color: dark ? "#f87171" : "#dc2626" }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={loading
                    ? { background: dark ? "#111" : "#e5e5e5", color: dark ? "#444" : "#aaa", cursor: "not-allowed" }
                    : { background: "#F5A623", color: "#000" }
                  }
                >
                  {loading && <SpinnerIcon />}
                  {loading ? "Searching…" : "Search Jobs →"}
                </button>
              </div>
            </div>

            {/* Results */}
            {(loading || searched) && (
              <div className="space-y-4" style={{ animation: "fadeUp 0.4s ease-out" }}>
                <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div style={{ height: 1, flex: 1, background: border }} />
                  <span className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: dark ? "#444" : "#bbb" }}>
                    {loading ? "Searching…" : `${jobs.length} result${jobs.length !== 1 ? "s" : ""}`}
                  </span>
                  <div style={{ height: 1, flex: 1, background: border }} />
                </div>

                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="h-28 rounded-2xl animate-pulse"
                      style={{ background: dark ? "#0d0d0d" : "#ffffff", border: `1px solid ${border}` }} />
                  ))
                ) : jobs.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-sm" style={{ color: textSub }}>No jobs found. Try a different keyword or category.</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <JobCard key={job.id} job={job} dark={dark} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
