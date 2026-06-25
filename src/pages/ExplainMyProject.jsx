import { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { auth, db, googleProvider as provider } from "../firebase/config";
import Subscription from "../components/Subscription";

const API_URL = import.meta.env.VITE_API_URL;

const FREE_CREDITS = 3;

// ─── Firestore helpers ────────────────────────────────────────────────────────
async function createUserDoc(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid);
  await setDoc(ref, {
    name:      firebaseUser.displayName,
    email:     firebaseUser.email,
    photoURL:  firebaseUser.photoURL,
    plan:      "free",
    credits:   FREE_CREDITS,
    createdAt: new Date().toISOString(),
  });
  return { plan: "free", credits: FREE_CREDITS };
}

async function getUserData(firebaseUser) {
  const ref  = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  return createUserDoc(firebaseUser);
}

async function spendCredit(uid) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { credits: increment(-1) });
}

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── Result card config ───────────────────────────────────────────────────────
const CARD_CONFIG = {
  "Elevator Pitch": {
    light: "text-violet-600 bg-violet-50 border-violet-200",
    dark:  "text-violet-400 bg-violet-900/40 border-violet-700",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  "Detailed Explanation": {
    light: "text-sky-600 bg-sky-50 border-sky-200",
    dark:  "text-sky-400 bg-sky-900/40 border-sky-700",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  "Tech Stack Justification": {
    light: "text-emerald-600 bg-emerald-50 border-emerald-200",
    dark:  "text-emerald-400 bg-emerald-900/40 border-emerald-700",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  "Challenges & Solutions": {
    light: "text-amber-600 bg-amber-50 border-amber-200",
    dark:  "text-amber-400 bg-amber-900/40 border-amber-700",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  "Interview Q&A": {
    light: "text-rose-600 bg-rose-50 border-rose-200",
    dark:  "text-rose-400 bg-rose-900/40 border-rose-700",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
};

const FREE_UNLOCKED = ["Elevator Pitch", "Detailed Explanation", "Tech Stack Justification", "Challenges & Solutions"];
const ALL_CARDS = [
  "Elevator Pitch",
  "Detailed Explanation",
  "Tech Stack Justification",
  "Challenges & Solutions",
  "Interview Q&A",
];

// ─── ResultCard ───────────────────────────────────────────────────────────────
function ResultCard({ title, content, dark, locked, partialLock, onUpgrade }) {
  const [copied, setCopied] = useState(false);
  const cfg      = CARD_CONFIG[title] || { light: "text-stone-600 bg-stone-50 border-stone-200", dark: "text-stone-400 bg-stone-800 border-stone-600", icon: null };
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
    <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all duration-200
      ${dark ? "bg-stone-900 border-stone-700 hover:border-stone-500" : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-md"}
      ${locked ? "opacity-80" : ""}`}>

      {/* Card header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${iconColor}`}>{cfg.icon}</div>
          <h3 className={`text-sm font-semibold ${dark ? "text-stone-100" : "text-stone-800"}`}>{title}</h3>
          {locked && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
              ${dark ? "bg-amber-900/40 text-amber-400 border border-amber-700" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
              <LockIcon /> Pro
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

      {/* Card body */}
      {locked ? (
        <div className="px-5 py-8 flex flex-col items-center justify-center text-center gap-3">
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
            Upgrade to Pro — ₹99/mo
          </button>
        </div>
      ) : (
        <div className="px-5 py-5">
          {Array.isArray(content) ? (
            <div className="space-y-5">
              {content.map((item, i) => (
                <div key={i}>
                  <p className={`text-sm font-semibold mb-1.5 ${dark ? "text-stone-200" : "text-stone-700"}`}>
                    Q{i + 1}. {item.q}
                  </p>
                  <p className={`text-sm leading-relaxed pl-4 border-l-2 ${dark ? "text-stone-400 border-violet-600" : "text-stone-600 border-violet-200"}`}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm leading-relaxed whitespace-pre-line ${dark ? "text-stone-400" : "text-stone-600"}`}>
              {content}
            </p>
          )}
          {/* Partial lock — shown after the visible Q&As */}
          {partialLock && (
            <div className={`mt-5 flex flex-col items-center gap-3 py-5 rounded-xl border-t
              ${dark ? "border-stone-800" : "border-stone-100"}`}>
              <div className="flex items-center gap-2">
                <LockIcon />
                <span className={`text-sm font-medium ${dark ? "text-stone-400" : "text-stone-500"}`}>
                  More Q&amp;As locked — upgrade to see all
                </span>
              </div>
              <button
                onClick={onUpgrade}
                className="px-4 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors duration-150"
              >
                Upgrade to Pro — ₹99/mo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
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

// ─── Credits Banner ───────────────────────────────────────────────────────────
function CreditsBanner({ credits, dark, onUpgrade, isPro }) {
  if (isPro) return null;
  return (
    <div className={`mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm`}
      style={credits > 0
        ? { background: dark ? "rgba(245,166,35,0.08)" : "rgba(245,166,35,0.1)", borderColor: dark ? "rgba(245,166,35,0.35)" : "rgba(245,166,35,0.45)", color: "#F5A623" }
        : { background: dark ? "rgba(239,68,68,0.12)" : "rgba(254,242,242,1)", borderColor: dark ? "#7f1d1d" : "#fecaca", color: dark ? "#f87171" : "#dc2626" }
      }>
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
          ${credits > 0 ? "bg-[#F5A623] text-black hover:bg-[#e8961a]" : "bg-red-600 text-white hover:bg-red-700"}`}
      >
        Upgrade
      </button>
    </div>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────────────────
function LoginModal({ dark, onClose, onLoginSuccess, authLoading, authError }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl transition-colors duration-300
        ${dark ? "bg-[#0d0d0d] border-[#1a1a1a]" : "bg-white border-stone-200"}`}>

        <div className="flex items-center justify-center mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: "#F5A623" }}>
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path d="M2 10L5 4L8 8L10 6L12 10H2Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
        </div>

        <h2 className={`text-base font-bold mb-1 text-center ${dark ? "text-stone-50" : "text-stone-900"}`}>
          Sign in to continue
        </h2>
        <p className={`text-xs mb-6 text-center ${dark ? "text-stone-500" : "text-stone-400"}`}>
          Get 3 free generations — no credit card needed
        </p>

        {authError && (
          <div className={`mb-4 px-3 py-2.5 rounded-lg border text-xs
            ${dark ? "bg-red-900/30 border-red-700 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}>
            {authError}
          </div>
        )}

        <button
          onClick={onLoginSuccess}
          disabled={authLoading}
          className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border text-sm font-medium transition-all duration-150
            ${authLoading ? "opacity-60 cursor-not-allowed" : ""}
            ${dark
              ? "border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700"
              : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50 shadow-sm"
            }`}
        >
          {authLoading ? (
            <SpinnerIcon />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {authLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className={`text-xs text-center mt-4 ${dark ? "text-stone-600" : "text-stone-400"}`}>
          By signing in you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}

// ─── ExplainMyProject (main page) ─────────────────────────────────────────────
export default function ExplainMyProject({ dark }) {

  // Auth state
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData]         = useState(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [authError, setAuthError]       = useState("");
  const [showLogin, setShowLogin]       = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  // Form & result state
  const [form, setForm] = useState({
    projectName: "", techStack: "", description: "", contribution: "", challenge: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  // ── Firebase auth listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
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
    return () => unsubscribe();
  }, []);

  // ── Google Sign In ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const res    = await signInWithPopup(auth, provider);
      const fbUser = res.user;
      setFirebaseUser(fbUser);
      const data = await getUserData(fbUser);
      setUserData(data);
      setShowLogin(false);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        setAuthError("Sign in failed. Please try again.");
        console.error("Google sign-in error:", err);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Sign Out ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setUserData(null);
    setResult(null);
  };

  // ── Upgrade (Razorpay hook-in) ──────────────────────────────────────────────
  const handleSelectPlan = async (planId) => {
    const planAmounts = { pro_monthly: 9900, pro_yearly: 99900 };
    const amount = planAmounts[planId];
    if (!amount) { setShowSubscription(false); return; }

    try {
      const res = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, planId }),
      });
      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "PrepNPitch",
        description: planId === "pro_monthly" ? "Pro Plan — ₹99/month" : "Annual Plan — ₹999/year",
        order_id: order.id,
        handler: async (response) => {
          try {
            await fetch(`${API_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, planId, uid: firebaseUser?.uid }),
            });
          } catch {/* ignore verify errors */}
          if (firebaseUser) {
            await updateDoc(doc(db, "users", firebaseUser.uid), { plan: planId, credits: 999999 });
            setUserData((prev) => ({ ...prev, plan: planId, credits: 999999 }));
          }
          setShowSubscription(false);
        },
        theme: { color: "#F5A623" },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Could not initiate payment. Please try again.");
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────────
  const isPro       = userData?.plan && userData.plan !== "free";
  const credits     = userData?.credits ?? 0;
  const canGenerate = isPro || credits > 0;

  const set     = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const isValid = Object.values(form).every((v) => v.trim() !== "");

  // ── Download PDF ──────────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!result) return;
    if (!isPro) { setShowSubscription(true); return; }

    const sections = [
      { title: "Elevator Pitch", content: result.elevatorPitch },
      { title: "Detailed Explanation", content: result.detailedExplanation },
      { title: "Tech Stack Justification", content: result.techStackJustification },
      { title: "Challenges & Solutions", content: result.challengesAndSolutions },
      { title: "Interview Q&A", content: result.interviewQA },
    ].filter((s) => isPro || ["Elevator Pitch", "Tech Stack Justification", "Challenges & Solutions"].includes(s.title));

    const qaHtml = (items) =>
      items.map((item, i) => `
        <div style="margin-bottom:20px">
          <p style="font-weight:700;color:#7c3aed;margin-bottom:6px">Q${i + 1}. ${item.q}</p>
          <p style="margin:0;padding-left:14px;border-left:3px solid #e5e7eb;color:#374151">${item.a}</p>
        </div>`).join("");

    const sectionsHtml = sections.map((s) => `
      <div style="margin-bottom:32px;page-break-inside:avoid">
        <h2 style="font-size:16px;font-weight:700;color:#111;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #F5A623">${s.title}</h2>
        ${Array.isArray(s.content) ? qaHtml(s.content) : `<p style="margin:0;line-height:1.8;color:#374151">${s.content || ""}</p>`}
      </div>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>${form.projectName || "Project Explanation"} — PrepNPitch</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#111;padding:40px;max-width:800px;margin:auto}
        @media print{body{padding:20px}@page{margin:20mm}}
      </style>
    </head><body>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #f0f0f0">
        <div style="width:36px;height:36px;border-radius:8px;background:#F5A623;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#000">P</div>
        <div>
          <p style="font-size:18px;font-weight:800;color:#111">${form.projectName || "My Project"}</p>
          <p style="font-size:12px;color:#888;margin-top:2px">Generated by PrepNPitch · ${new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p>
        </div>
      </div>
      ${form.techStack ? `<p style="font-size:12px;color:#6b7280;margin-bottom:28px"><strong>Tech stack:</strong> ${form.techStack}</p>` : ""}
      ${sectionsHtml}
      <p style="margin-top:40px;font-size:11px;color:#aaa;text-align:center">Generated with PrepNPitch</p>
    </body></html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  };

  // ── Generate ─────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!isValid || loading) return;
    if (!firebaseUser) { setShowLogin(true); return; }
    if (!canGenerate)  { setShowSubscription(true); return; }

    setLoading(true);
    setResult(null);

    if (!isPro) {
      await spendCredit(firebaseUser.uid);
      setUserData((prev) => ({ ...prev, credits: prev.credits - 1 }));
    }

    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res  = await fetch(`${API_URL}/generate`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body:    JSON.stringify({ formData: form }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          // Refund the credit since the request was blocked
          if (!isPro) {
            await updateDoc(doc(db, "users", firebaseUser.uid), { credits: increment(1) });
            setUserData((prev) => ({ ...prev, credits: prev.credits + 1 }));
          }
          setShowSubscription(true);
          return;
        }
        throw new Error(errData.message || errData.error || "Server error. Please try again.");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      if (!isPro) {
        // refund the credit if generation failed
        await updateDoc(doc(db, "users", firebaseUser.uid), { credits: increment(1) });
        setUserData((prev) => ({ ...prev, credits: prev.credits + 1 }));
      }
      setResult({ error: err.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ── Input / label classes ────────────────────────────────────────────────────
  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-150 resize-none leading-relaxed
    ${dark
      ? "bg-[#111] border-[#222] text-stone-100 placeholder:text-stone-500 hover:border-[#333]"
      : "bg-stone-50 border-stone-200 text-stone-800 placeholder:text-stone-400 focus:bg-white hover:border-stone-300"
    }`;
  const labelCls = `text-xs font-semibold uppercase tracking-wide ${dark ? "text-stone-400" : "text-stone-500"}`;

  const generateBtnLabel = !firebaseUser
    ? "Sign in to Generate"
    : !canGenerate
      ? "No Credits — Upgrade to Pro"
      : loading
        ? "Generating..."
        : "Generate Explanation";

  // ── Auth loading screen ──────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#050505" : "#f5f5f0" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-md animate-pulse">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path d="M2 10L5 4L8 8L10 6L12 10H2Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <p className={`text-xs ${dark ? "text-stone-500" : "text-stone-400"}`}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: dark ? "#050505" : "#f5f5f0", transition: "background 0.3s" }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", top: "-10rem", right: "-10rem", width: "24rem", height: "24rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(245,166,35,0.07)" : "rgba(245,166,35,0.12)", transition: "background 0.3s" }} />
        <div style={{ position: "absolute", top: "50%", left: "-8rem", width: "20rem", height: "20rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(78,205,196,0.06)" : "rgba(78,205,196,0.10)" }} />
        <div style={{ position: "absolute", bottom: 0, right: "33%", width: "16rem", height: "16rem", borderRadius: "50%", filter: "blur(80px)", background: dark ? "rgba(245,166,35,0.05)" : "rgba(245,166,35,0.08)" }} />
      </div>

      {/* ── Main ── */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className={`inline-flex items-center gap-1.5 border text-xs font-medium px-3 py-1.5 rounded-full mb-5`}
            style={{ background: dark ? "rgba(245,166,35,0.1)" : "rgba(245,166,35,0.12)", borderColor: dark ? "rgba(245,166,35,0.4)" : "rgba(245,166,35,0.5)", color: "#F5A623" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            AI-powered · For job seekers & developers
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 ${dark ? "text-stone-50" : "text-stone-900"}`}
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Explain Your Project<br />
            <span style={{ color: "#F5A623" }}>Like a Pro</span>
          </h1>
          <p className={`text-base max-w-md mx-auto leading-relaxed ${dark ? "text-stone-400" : "text-stone-500"}`}>
            Turn your project into interview-ready answers in seconds.
          </p>
        </div>

        {firebaseUser && (
          <CreditsBanner
            credits={isPro ? Infinity : credits}
            dark={dark}
            onUpgrade={() => setShowSubscription(true)}
            isPro={isPro}
          />
        )}

        {/* Form Card */}
    <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300`}
          style={{ background: dark ? "#0d0d0d" : "#ffffff", borderColor: dark ? "#1a1a1a" : "#e5e5e5" }}>
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
              disabled={loading || (firebaseUser && !canGenerate)}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none
                ${loading || (firebaseUser && !canGenerate)
                  ? dark ? "bg-stone-800 text-stone-600 cursor-not-allowed" : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : !firebaseUser || !isValid
                    ? dark ? "bg-stone-800 text-stone-400 hover:bg-stone-700 border border-stone-700" : "bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-200"
                    : "bg-[#F5A623] text-black hover:bg-[#e8961a] active:scale-[0.99] shadow-md"
                }`}
            >
              {loading && <SpinnerIcon />}
              {generateBtnLabel}
            </button>

            {!isValid && firebaseUser && (
              <p className={`text-center text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>
                Fill in all fields to unlock generation
              </p>
            )}
            {!firebaseUser && (
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

            {!loading && result && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleDownloadPDF}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all duration-150
                    ${dark
                      ? "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 shadow-sm"
                    }`}
                >
                  {isPro ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  )}
                  Download PDF {!isPro && <span className="ml-0.5 text-[10px] font-bold text-amber-500">PRO</span>}
                </button>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => <SkeletonCard key={i} dark={dark} />)}
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
                  const isQA = title === "Interview Q&A";
                  const locked = !isPro && !FREE_UNLOCKED.includes(title);
                  const contentMap = {
                    "Elevator Pitch":           result.elevatorPitch,
                    "Detailed Explanation":     result.detailedExplanation,
                    "Tech Stack Justification": result.techStackJustification,
                    "Challenges & Solutions":   result.challengesAndSolutions,
                    "Interview Q&A":            result.interviewQA,
                  };
                  const rawContent = contentMap[title];
                  // Free users: show only the first Q&A, lock the rest
                  const visibleContent = (!isPro && isQA && Array.isArray(rawContent))
                    ? rawContent.slice(0, 1)
                    : rawContent;
                  const partialLock = !isPro && isQA && Array.isArray(rawContent) && rawContent.length > 1;
                  return (
                    <ResultCard
                      key={title}
                      title={title}
                      content={visibleContent}
                      dark={dark}
                      locked={locked}
                      partialLock={partialLock}
                      onUpgrade={() => setShowSubscription(true)}
                    />
                  );
                })}
                {!isPro && (
                  <div className={`rounded-2xl border p-5 text-center
                    ${dark ? "bg-[#F5A623]/10 border-[#F5A623]/40" : "bg-[#F5A623]/10 border-[#F5A623]/40"}`} style={{ color: "#F5A623" }}>
                    <p className={`text-sm font-semibold mb-1`} style={{ color: "#F5A623" }}>
                      Unlock all sections with Pro
                    </p>
                    <p className={`text-xs mb-3 ${dark ? "text-stone-500" : "text-stone-400"}`}>
                      Unlimited generations + Detailed Explanation, Tech Stack Justification, Challenges & Solutions
                    </p>
                    <button
                      onClick={() => setShowSubscription(true)}
                      className="px-5 py-2 text-black text-sm font-semibold rounded-xl transition-colors duration-150"
                      style={{ background: "#F5A623" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#e8961a"}
                      onMouseLeave={e => e.currentTarget.style.background = "#F5A623"}
                    >
                      Upgrade to Pro — ₹99/mo
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      {showSubscription && (
        <Subscription
          dark={dark}
          onClose={() => setShowSubscription(false)}
          onSelectPlan={handleSelectPlan}
          currentPlan={isPro ? userData.plan : "free"}
        />
      )}
      {showLogin && (
        <LoginModal
          dark={dark}
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleGoogleLogin}
          authLoading={authLoading}
          authError={authError}
        />
      )}
    </div>
  );
}