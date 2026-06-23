import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
const NAV_ITEMS = [
  { id: "explain", label: "PitchMyProject" },
  { id: "resume", label: "Resume Checker" },
  { id: "jobmatch", label: "JD Match" },
  { id: "interview", label: "Mock Interview" },
  { id: "findjobs", label: "Find Jobs", pro: true },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.02 0-.7-.7M6.34 6.34l-.7-.7M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ─── User Avatar ──────────────────────────────────────────────────────────────
function Avatar({ user }) {
  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
      {initials}
    </div>
  );
}

// ─── Credits Pill ─────────────────────────────────────────────────────────────
function CreditsPill({ credits, dark, onSubscribe }) {
  if (credits === null || credits === undefined) return null;
  const low = credits <= 1;
  return (
    <button
      onClick={onSubscribe}
      className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150
        ${low
          ? dark
            ? "bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50"
            : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : dark
            ? "bg-violet-900/30 border-violet-700 text-violet-400 hover:bg-violet-900/50"
            : "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100"
        }`}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
      {credits} left
    </button>
  );
}

// ─── User Dropdown ────────────────────────────────────────────────────────────
function UserDropdown({ user, dark, onLogout, onSubscribe, credits }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-150 text-sm
          ${dark
            ? "bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-200"
            : "bg-white border-stone-200 hover:bg-stone-50 text-stone-700 shadow-sm"
          }`}
      >
        <Avatar user={user} />
        <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate">
          {user.name?.split(" ")[0]}
        </span>
        {user.isPro && (
          <span className={`hidden sm:inline-block text-xs font-semibold px-1.5 py-0.5 rounded-md
            ${dark ? "bg-violet-900/50 text-violet-300" : "bg-violet-100 text-violet-700"}`}>
            Pro
          </span>
        )}
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-lg z-50 overflow-hidden
          ${dark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200"}`}>
          {/* User info */}
          <div className={`px-4 py-3 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
            <p className={`text-xs font-semibold truncate ${dark ? "text-stone-200" : "text-stone-800"}`}>
              {user.name}
            </p>
            <p className={`text-xs truncate mt-0.5 ${dark ? "text-stone-500" : "text-stone-400"}`}>
              {user.email}
            </p>
            <div className="mt-2">
              {user.isPro ? (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
                  ${dark ? "bg-violet-900/50 text-violet-300" : "bg-violet-100 text-violet-700"}`}>
                  ✦ Pro plan
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                  ${dark ? "bg-stone-800 text-stone-500" : "bg-stone-100 text-stone-500"}`}>
                  Free · {credits ?? 0} credits left
                </span>
              )}
            </div>
          </div>

          {/* Upgrade CTA for free users */}
          {!user.isPro && (
            <div className={`px-4 py-2.5 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
              <button
                onClick={() => { onSubscribe(); setOpen(false); }}
                className="w-full text-xs font-semibold px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-150"
              >
                Upgrade to Pro — ₹99/mo
              </button>
            </div>
          )}

          {/* Sign out */}
          <div className="px-2 py-1.5">
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className={`w-full flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-150
                ${dark
                  ? "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
/**
 * Props:
 *   dark        boolean
 *   setDark      (bool) => void
 *   user        { name, email, isPro } | null
 *   onLogin      () => void
 *   onLogout     () => void
 *   credits      number | null   (null = Pro user, hide pill)
 *   onSubscribe  () => void
 */
export default function Header({ dark, setDark, user, onLogin, onLogout, credits, onSubscribe }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const ROUTE_MAP = {
    explain:   "/explain",
    interview: "/interviewprep",
    resume:    "/resumecheck",
    jobmatch:  "/jobmatch",
    findjobs:  "/findjobs",
  };

  const navTo = (id) => navigate(ROUTE_MAP[id]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] h-[64px] px-4 sm:px-8 transition-all duration-300
        ${scrolled
          ? dark
            ? "bg-[rgba(5,5,5,0.92)] backdrop-blur-[12px] border-b border-[#111]"
            : "bg-white/90 backdrop-blur-[12px] border-b border-stone-200/80 shadow-sm"
          : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="h-full flex items-center justify-between gap-3 max-w-7xl mx-auto">
        
        {/* 1. Logo */}
        <div 
          className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div 
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "#F5A623" }}
          >
            <span style={{ fontSize: 14, fontWeight: 800, color: "#000", fontFamily: "'Syne', sans-serif" }}>
              P
            </span>
          </div>
          <div className="flex flex-col leading-none">
            <span 
              style={{ fontFamily: "'Syne', sans-serif" }}
              className={`text-base font-bold tracking-tight ${dark ? "text-white" : "text-stone-900"}`}
            >
              PrepNPitch
            </span>
            <span className={`text-[10px] font-medium hidden sm:block mt-0.5 ${dark ? "text-stone-500" : "text-stone-400"}`}>
              Ace every interview
            </span>
          </div>
        </div>

        {/* 2. Center Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(n => (
            <button
              key={n.id}
              className="px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-stone-800/20 flex items-center gap-1.5"
              onClick={() => navTo(n.id)}
              style={{ 
                color: ROUTE_MAP[n.id] === location.pathname ? "#F5A623" : (dark ? "#999" : "#666") 
              }}
            >
              {n.label}
              {n.pro && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: "#F5A623", color: "#000", lineHeight: 1.4 }}>
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 3. Right side controls */}
        <div className="flex items-center gap-3">
          
          {/* Credits pill */}
          {user && !user.isPro && (
            <CreditsPill credits={credits} dark={dark} onSubscribe={onSubscribe} />
          )}

          {/* Dark mode toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
            className={`p-2 rounded-lg border transition-all duration-150 flex items-center justify-center
              ${dark
                ? "bg-stone-800/50 border-stone-700 text-stone-400 hover:bg-stone-700 hover:text-stone-200"
                : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 shadow-sm"
              }`}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Auth / CTA Button */}
          {user ? (
            <UserDropdown
              user={user}
              dark={dark}
              onLogout={onLogout}
              onSubscribe={onSubscribe}
              credits={credits}
            />
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 text-[13px] font-bold px-5 py-2 rounded-lg transition-all duration-150 shadow-sm hover:scale-[1.02] active:scale-95"
              style={{ background: "#F5A623", color: "#000" }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Get started free
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 