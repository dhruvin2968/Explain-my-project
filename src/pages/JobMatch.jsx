import { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const FREE_CREDITS = 5;

async function getUserData(fbUser) {
  const ref  = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const newUser = {
    name:      fbUser.displayName,
    email:     fbUser.email,
    plan:      "free",
    credits:   FREE_CREDITS,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, newUser);
  return newUser;
}

const SpinnerIcon = () => (

// â”€â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

// â”€â”€â”€ Drop Zone â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DropZone({ onFile, dark, file, label = "Drop your resume PDF here" }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") onFile(f);
  }, [onFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleChange = (e) => { if (e.target.files[0]) onFile(e.target.files[0]); };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      style={{
        position: "relative",
        cursor: "pointer",
        borderRadius: 14,
        border: dragging
          ? "2px dashed #F5A623"
          : file
            ? `2px dashed ${dark ? "#166534" : "#16a34a"}`
            : `2px dashed ${dark ? "#222" : "#d4d4d4"}`,
        background: dragging
          ? "rgba(245,166,35,0.06)"
          : file
            ? (dark ? "rgba(22,101,52,0.1)" : "rgba(220,252,231,0.5)")
            : (dark ? "#0d0d0d" : "#fafaf8"),
        padding: "32px 24px",
        textAlign: "center",
        transition: "all 0.2s",
      }}
    >
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div style={{ padding: 12, borderRadius: 12, background: dark ? "rgba(22,101,52,0.3)" : "rgba(220,252,231,0.8)" }}>
            <FileIcon />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: dark ? "#4ade80" : "#15803d" }}>{file.name}</p>
            <p style={{ fontSize: 12, marginTop: 4, color: dark ? "#555" : "#999" }}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div style={{ padding: 16, borderRadius: 16, background: dark ? "#111" : "#ffffff", border: `1px solid ${dark ? "#222" : "#e5e5e5"}` }}>
            <UploadIcon />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f0f0f0" : "#0a0a0a" }}>{label}</p>
            <p style={{ fontSize: 12, marginTop: 4, color: dark ? "#555" : "#999" }}>or click to browse · PDF only · Max 5MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Match Ring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Score Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Skill Tag â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Prep Task Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ dark, onLogin }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-28 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: dark ? "rgba(245,166,35,0.1)" : "rgba(245,166,35,0.12)" }}>
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#F5A623" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: dark ? "#f0f0f0" : "#0a0a0a", fontFamily: "'Syne', sans-serif" }}>
        Sign in to check your job match
      </h2>
      <p className="text-sm max-w-xs mb-6" style={{ color: dark ? "#666" : "#888" }}>
        Get {FREE_CREDITS} free job match checks. No credit card needed.
      </p>
      <button
        onClick={onLogin}
        className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg"
        style={{ background: "#F5A623", color: "#000" }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}

// ─── No-Credits Gate ──────────────────────────────────────────────────────────
function NoCreditsGate({ dark, onSubscribe }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-28 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: dark ? "rgba(245,166,35,0.1)" : "rgba(245,166,35,0.12)" }}>
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#F5A623" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: dark ? "#f0f0f0" : "#0a0a0a", fontFamily: "'Syne', sans-serif" }}>
        You've used all your free checks
      </h2>
      <p className="text-sm max-w-xs mb-6" style={{ color: dark ? "#666" : "#888" }}>
        Upgrade to Pro for unlimited job match analysis.
      </p>
      <button
        onClick={onSubscribe}
        className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg"
        style={{ background: "#F5A623", color: "#000" }}
      >
        Upgrade to Pro →
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobMatch({ dark, onLogin, onSubscribe }) {
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

  const isPro   = userData?.plan && userData.plan !== "free";
  const credits = userData?.credits ?? 0;

  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(""); // "extracting" | "analyzing"
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const isValid = !!file && jd.trim().length > 50;

  // â”€â”€ Extract text from PDF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const extractText = async (pdfFile) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text.trim();
  };

  const handleMatch = async () => {
    if (!isValid || loading) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      setStep("extracting");
      const resumeText = await extractText(file);
      if (!resumeText || resumeText.length < 100) throw new Error("Could not extract text from PDF. Make sure it's not a scanned image.");

      setStep("analyzing");
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/job-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ resumeText, jobDescription: jd }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Server error. Please try again.");
      }
      const data = await res.json();
      setResult(data);
      if (typeof data.creditsRemaining === "number") {
        setUserData((prev) => prev ? { ...prev, credits: data.creditsRemaining } : prev);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStep("");
    }
  };

  const border = dark ? "#1a1a1a" : "#e5e5e5";
  const cardBg = dark ? "#0d0d0d" : "#ffffff";
  const textMain = dark ? "#f0f0f0" : "#0a0a0a";
  const textSub = dark ? "#666" : "#888";

  const textareaCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-150 resize-none leading-relaxed font-mono
    ${dark
      ? "bg-[#111] border-[#222] text-stone-100 placeholder:text-stone-600 hover:border-[#333]"
      : "bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:bg-white hover:border-stone-300"
    }`;

  const labelCls = `text-xs font-semibold uppercase tracking-wide ${dark ? "text-stone-500" : "text-stone-400"}`;

  // Auth loading
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#050505" : "#f5f5f0" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse" style={{ background: "#F5A623" }} />
          <p className="text-xs" style={{ color: dark ? "#555" : "#aaa" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: dark ? "#050505" : "#f5f5f0", transition: "background 0.3s" }}>

      {/* Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", top: "-10rem", right: "-10rem", width: "24rem", height: "24rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(167,139,250,0.07)" : "rgba(167,139,250,0.12)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "-8rem", width: "20rem", height: "20rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(14,165,233,0.06)" : "rgba(14,165,233,0.1)" }} />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(167,139,250,0.4)", borderRadius: 99, padding: "5px 14px", marginBottom: 32, fontSize: 11, color: "#A78BFA", fontFamily: "'JetBrains Mono', monospace", background: "rgba(167,139,250,0.08)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#A78BFA", display: "inline-block", animation: "blink 1.2s infinite" }} />
            AI-powered · Know your odds before you apply
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 ${dark ? "text-stone-50" : "text-stone-900"}`}
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Job Match Score<br />
            <span style={{ color: "#F5A623" }}>Know before you apply.</span>
          </h1>
          <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: textSub }}>
            Upload your resume PDF and paste the job description. Get a match score, skill gaps, and a prep plan in seconds.
          </p>
        </div>

        {/* Auth / Credit gate */}
        {!firebaseUser ? (
          <AuthGate dark={dark} onLogin={onLogin} />
        ) : !isPro && credits <= 0 ? (
          <NoCreditsGate dark={dark} onSubscribe={onSubscribe} />
        ) : (
          <>

        {/* Input Card */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
          <div className="px-6 sm:px-8 pt-6 pb-3" style={{ borderBottom: `1px solid ${border}` }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: dark ? "#555" : "#999" }}>
              Match Details
            </h2>
          </div>
          <div className="px-6 sm:px-8 py-6 space-y-5">

            {/* PDF Resume Upload */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Your Resume <span className="normal-case font-normal">(PDF)</span></label>
              <DropZone onFile={setFile} dark={dark} file={file} label="Drop your resume PDF here" />
            </div>

            {/* JD Textarea */}
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
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm"
                style={{ background: dark ? "rgba(239,68,68,0.1)" : "#fef2f2", borderColor: dark ? "#7f1d1d" : "#fecaca", color: dark ? "#f87171" : "#dc2626" }}>
                <AlertIcon /> {error}
              </div>
            )}

            <button
              onClick={handleMatch}
              disabled={!isValid || loading}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={!isValid || loading
                ? { background: dark ? "#111" : "#e5e5e5", color: dark ? "#444" : "#aaa", cursor: "not-allowed" }
                : { background: "#F5A623", color: "#000" }
              }
            >
              {loading && <SpinnerIcon />}
              {loading
                ? step === "extracting" ? "Reading PDF..." : "Analyzing match..."
                : "Check Job Match \u2192"}
            </button>

            {!isValid && !file && (
              <p className="text-center text-xs" style={{ color: dark ? "#444" : "#bbb" }}>
                Upload your resume PDF and paste the job description to continue
              </p>
            )}

            {!isPro && (
              <p className="text-center text-xs" style={{ color: dark ? "#444" : "#bbb" }}>
                {credits} free check{credits !== 1 ? "s" : ""} remaining ·{" "}
                <button onClick={onSubscribe} style={{ color: "#F5A623", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}>
                  Go Pro for unlimited
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {(loading || result) && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.4s ease-out" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <div className="flex items-center gap-3">
              <div style={{ height: 1, flex: 1, background: dark ? "#1a1a1a" : "#e5e5e5" }} />
              <span className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: dark ? "#444" : "#bbb" }}>
                {loading ? "Analyzing..." : "Your Results"}
              </span>
              <div style={{ height: 1, flex: 1, background: dark ? "#1a1a1a" : "#e5e5e5" }} />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: dark ? "#0d0d0d" : "#ffffff", border: `1px solid ${border}` }} />
                ))}
              </div>
            ) : result && (
              <>
                {/* Match ring + score bars */}
                <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${border}` }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                    <div className="flex justify-center">
                      <MatchRing score={result.overallMatch} />
                    </div>
                    <div className="space-y-4">
                      <ScoreBar label="Skills Match" score={result.skillsMatch} color="violet" dark={dark} />
                      <ScoreBar label="Experience Match" score={result.experienceMatch} color="sky" dark={dark} />
                      <ScoreBar label="Keyword Coverage" score={result.keywordCoverage} color="emerald" dark={dark} />
                      <ScoreBar label="Role Alignment" score={result.roleAlignment} color="amber" dark={dark} />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <BoltIcon />
                      <h3 className="text-sm font-semibold" style={{ color: textMain }}>AI Assessment</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: textSub }}>{result.summary}</p>
                  </div>
                )}

                {/* Matched + Missing Skills */}
                {(result.matchedSkills?.length > 0 || result.missingSkills?.length > 0) && (
                  <div className="rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}` }}>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: textMain }}>Skill Breakdown</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills?.map((s, i) => <SkillTag key={`m-${i}`} label={s} matched={true} dark={dark} />)}
                      {result.missingSkills?.map((s, i) => <SkillTag key={`g-${i}`} label={s} matched={false} dark={dark} />)}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs" style={{ color: dark ? "#555" : "#bbb" }}>
                        <span className="text-emerald-500 font-semibold">âœ“</span> You have Â· <span className="text-red-500 font-semibold">âœ—</span> Missing
                      </span>
                    </div>
                  </div>
                )}

                {/* Prep Plan */}
                {result.prepPlan?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookIcon />
                      <h3 className="text-sm font-semibold" style={{ color: textMain }}>Your Prep Plan</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: dark ? "rgba(167,139,250,0.15)" : "rgba(167,139,250,0.1)", color: "#A78BFA" }}>
                        {result.prepPlan.length} topics Â· ~{result.prepPlan.reduce((a, t) => a + (t.hours || 2), 0)}h total
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {result.prepPlan.map((task, i) => <PrepCard key={i} task={task} index={i} dark={dark} />)}
                    </div>
                  </div>
                )}

                {/* Done */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 border text-xs font-medium px-3.5 py-1.5 rounded-full"
                    style={{ background: dark ? "rgba(16,185,129,0.1)" : "rgba(209,250,229,0.8)", borderColor: dark ? "#065f46" : "#6ee7b7", color: dark ? "#34d399" : "#059669" }}>
                    <CheckIcon /> Analysis complete Â· Fix the gaps before applying
                  </span>
                </div>
                </>
            )}
              </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}
