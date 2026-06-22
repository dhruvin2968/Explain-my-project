import { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Required: set worker source in your main.jsx or index.js:
// import * as pdfjsLib from "pdfjs-dist";
// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

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

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorMap = {
    violet: { stroke: "#7c3aed", text: "#7c3aed", bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-200 dark:border-violet-800" },
    emerald: { stroke: "#059669", text: "#059669", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
    amber: { stroke: "#d97706", text: "#d97706", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
    rose: { stroke: "#e11d48", text: "#e11d48", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800" },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${c.bg} ${c.border}`}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-stone-200 dark:text-stone-700" />
        <circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke={c.stroke}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="44" y="44" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700" fill={c.stroke}>
          {score}
        </text>
      </svg>
      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 text-center">{label}</span>
    </div>
  );
}

// ─── Bullet Card ──────────────────────────────────────────────────────────────
function BulletCard({ original, rewrite, dark, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200
      ${dark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200"}`}>
      {/* Original */}
      <div className={`px-4 py-3 border-b ${dark ? "border-stone-800 bg-stone-800/50" : "border-stone-100 bg-stone-50"}`}>
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 flex-shrink-0 p-1 rounded-full ${dark ? "bg-red-900/40" : "bg-red-100"}`}>
            <AlertIcon />
          </span>
          <div>
            <p className="text-xs font-semibold text-red-500 mb-1">Weak bullet #{index + 1}</p>
            <p className={`text-sm leading-relaxed ${dark ? "text-stone-400" : "text-stone-500"}`}>{original}</p>
          </div>
        </div>
      </div>
      {/* Rewrite */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span className={`mt-0.5 flex-shrink-0 p-1 rounded-full ${dark ? "bg-emerald-900/40" : "bg-emerald-100"}`}>
              <CheckIcon />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-500 mb-1">Suggested rewrite</p>
              <p className={`text-sm leading-relaxed ${dark ? "text-stone-200" : "text-stone-700"}`}>{rewrite}</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all
              ${copied
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : dark
                  ? "bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700"
                  : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
              }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────
function DropZone({ onFile, dark, file }) {
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
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-10 text-center
        ${dragging
          ? dark ? "border-violet-500 bg-violet-900/20" : "border-violet-400 bg-violet-50"
          : file
            ? dark ? "border-emerald-600 bg-emerald-900/10" : "border-emerald-400 bg-emerald-50"
            : dark ? "border-stone-700 hover:border-stone-500 bg-stone-900" : "border-stone-300 hover:border-violet-300 bg-stone-50"
        }`}
    >
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />

      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-xl ${dark ? "bg-emerald-900/40" : "bg-emerald-100"}`}>
            <FileIcon />
          </div>
          <div>
            <p className={`text-sm font-semibold ${dark ? "text-emerald-400" : "text-emerald-700"}`}>{file.name}</p>
            <p className={`text-xs mt-1 ${dark ? "text-stone-500" : "text-stone-400"}`}>
              {(file.size / 1024).toFixed(1)} KB · Click to change
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-2xl ${dark ? "bg-stone-800" : "bg-white border border-stone-200 shadow-sm"}`}>
            <UploadIcon />
          </div>
          <div>
            <p className={`text-sm font-semibold ${dark ? "text-stone-200" : "text-stone-700"}`}>
              Drop your resume PDF here
            </p>
            <p className={`text-xs mt-1 ${dark ? "text-stone-500" : "text-stone-400"}`}>
              or click to browse · PDF only · Max 5MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ dark, className }) {
  return (
    <div className={`rounded-full animate-pulse ${dark ? "bg-stone-800" : "bg-stone-100"} ${className}`} />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResumeChecker({ dark, setDark, user, onLogin, onLogout, credits, onSubscribe }) {
  const [file, setFile]           = useState(null);
  const [jobRole, setJobRole]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState(""); // "extracting" | "analyzing"
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");

  // ── Extract text from PDF using pdfjs ──────────────────────────────────────
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

  // ── Analyze ────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      setStep("extracting");
      const resumeText = await extractText(file);

      if (!resumeText || resumeText.length < 100) {
        throw new Error("Could not extract text from PDF. Make sure it's not a scanned image.");
      }

      setStep("analyzing");
      // const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/parse-resume`, {
      const res = await fetch(`https://prepnpitch-backend.onrender.com/parse-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobRole: jobRole.trim() }),
      });

      if (!res.ok) throw new Error("Server error. Please try again.");
      const data = await res.json();
      setResult(data);

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStep("");
    }
  };

  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-150
    ${dark
      ? "bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
      : "bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
    }`;

  return (
    <div style={{ minHeight: "100vh", background: dark ? "#050505" : "#f5f5f0", transition: "background 0.3s" }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", top: "-10rem", right: "-10rem", width: "24rem", height: "24rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.1)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "-8rem", width: "20rem", height: "20rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(167,139,250,0.06)" : "rgba(167,139,250,0.1)" }} />
      </div>

     
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className={`inline-flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-full mb-5
            ${dark ? "bg-rose-900/30 border-rose-700 text-rose-400" : "bg-rose-50 border-rose-200/70 text-rose-600"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            AI-powered · ATS & impact analysis
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 ${dark ? "text-stone-50" : "text-stone-900"}`}>
            Resume Checker<br />
            <span className="text-rose-500">Find what's holding you back.</span>
          </h1>
          <p className={`text-base max-w-md mx-auto leading-relaxed ${dark ? "text-stone-400" : "text-stone-500"}`}>
            Upload your PDF resume. We score it, find keyword gaps, and rewrite weak bullets — in seconds.
          </p>
        </div>

        {/* Upload Card */}
        <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300 mb-6
          ${dark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"}`}>
          <div className={`px-6 sm:px-8 pt-6 pb-3 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
            <h2 className={`text-xs font-semibold uppercase tracking-widest ${dark ? "text-stone-500" : "text-stone-400"}`}>
              Upload Resume
            </h2>
          </div>
          <div className="px-6 sm:px-8 py-6 space-y-4">
            <DropZone onFile={setFile} dark={dark} file={file} />

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-stone-400" : "text-stone-500"}`}>
                Target Job Role <span className={`normal-case font-normal ${dark ? "text-stone-600" : "text-stone-400"}`}>(optional but recommended)</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Backend Engineer, SDE-2, Data Analyst"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>

            {error && (
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm
                ${dark ? "bg-red-900/20 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}>
                <AlertIcon />
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${!file || loading
                  ? dark ? "bg-stone-800 text-stone-600 cursor-not-allowed" : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.99] shadow-md shadow-rose-900/30"
                }`}
            >
              {loading && <SpinnerIcon />}
              {loading
                ? step === "extracting" ? "Reading PDF..." : "Analyzing with AI..."
                : "Analyze Resume"
              }
            </button>

            {!file && (
              <p className={`text-center text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>
                Upload a PDF resume to get started
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {(loading || result) && (
          <div className="space-y-6" style={{ animation: "fadeUp 0.4s ease-out" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {/* Score Cards */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-px flex-1 ${dark ? "bg-stone-800" : "bg-stone-200"}`} />
                <span className={`text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${dark ? "text-stone-600" : "text-stone-400"}`}>
                  {loading ? "Analyzing..." : "Your Scores"}
                </span>
                <div className={`h-px flex-1 ${dark ? "bg-stone-800" : "bg-stone-200"}`} />
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`rounded-2xl border p-4 flex flex-col items-center gap-2 animate-pulse
                      ${dark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"}`}>
                      <div className={`w-[88px] h-[88px] rounded-full ${dark ? "bg-stone-800" : "bg-stone-100"}`} />
                      <Skeleton dark={dark} className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : result && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ScoreRing score={result.atsScore}       label="ATS Score"      color="violet" />
                  <ScoreRing score={result.keywordScore}   label="Keyword Match"  color="emerald" />
                  <ScoreRing score={result.impactScore}    label="Impact Clarity" color="amber" />
                  <ScoreRing score={result.formatScore}    label="Format & Length" color="rose" />
                </div>
              )}
            </div>

            {/* Overall Feedback */}
            {!loading && result?.overallFeedback && (
              <div className={`border rounded-2xl p-5 ${dark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200"}`}>
                <h3 className={`text-sm font-semibold mb-2 ${dark ? "text-stone-100" : "text-stone-800"}`}>
                  Overall Feedback
                </h3>
                <p className={`text-sm leading-relaxed ${dark ? "text-stone-400" : "text-stone-600"}`}>
                  {result.overallFeedback}
                </p>
              </div>
            )}

            {/* Keyword Gaps */}
            {!loading && result?.keywordGaps?.length > 0 && (
              <div className={`border rounded-2xl p-5 ${dark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg border ${dark ? "bg-amber-900/40 border-amber-700 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"}`}>
                    <AlertIcon />
                  </div>
                  <h3 className={`text-sm font-semibold ${dark ? "text-stone-100" : "text-stone-800"}`}>
                    Missing Keywords
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                    ${dark ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                    {result.keywordGaps.length} gaps
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywordGaps.map((kw, i) => (
                    <span key={i} className={`text-xs font-medium px-3 py-1.5 rounded-full border
                      ${dark ? "bg-stone-800 border-stone-700 text-stone-300" : "bg-stone-50 border-stone-200 text-stone-600"}`}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Bullets */}
            {!loading && result?.weakBullets?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`text-sm font-semibold ${dark ? "text-stone-100" : "text-stone-800"}`}>
                    Bullet Rewrites
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                    ${dark ? "bg-rose-900/40 text-rose-400" : "bg-rose-50 text-rose-600"}`}>
                    {result.weakBullets.length} improved
                  </span>
                </div>
                <div className="space-y-3">
                  {result.weakBullets.map((b, i) => (
                    <BulletCard
                      key={i}
                      index={i}
                      original={b.original}
                      rewrite={b.rewrite}
                      dark={dark}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Done banner */}
            {!loading && result && (
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-2 border text-xs font-medium px-3.5 py-1.5 rounded-full
                  ${dark ? "bg-emerald-900/30 border-emerald-700 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                  <CheckIcon /> Analysis complete · Fix the gaps above before applying
                </span>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}