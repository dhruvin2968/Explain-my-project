// Header.jsx — drop-in component, accepts dark/setDark + auth state as props
// When you integrate real auth (Firebase / Supabase / Clerk), replace the
// mock `user` prop with your real auth object and hook up onLogin/onLogout.

export default function Header({ dark, setDark, user, onLogin, onLogout, credits, onSubscribe }) {
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <header
      className={`relative z-20 border-b sticky top-0 backdrop-blur-sm transition-colors duration-300
        ${dark ? "border-stone-800 bg-stone-950/80" : "border-stone-200/80 bg-white/70"}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 10L5 4L8 8L10 6L12 10H2Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className={`text-sm font-semibold tracking-tight ${dark ? "text-stone-100" : "text-stone-800"}`}>
            ExplainMyProject
          </span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Credits pill — shown when logged in */}
          {user && (
            <div
              className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all duration-150
                ${credits === 0
                  ? dark
                    ? "bg-red-900/30 border-red-700 text-red-400"
                    : "bg-red-50 border-red-200 text-red-600"
                  : dark
                    ? "bg-violet-900/30 border-violet-700 text-violet-400"
                    : "bg-violet-50 border-violet-200 text-violet-700"
                }`}
              onClick={onSubscribe}
              title="View subscription plans"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              {credits === 0 ? "No credits" : `${credits} credit${credits !== 1 ? "s" : ""} left`}
            </div>
          )}

          {/* Upgrade button — shown when logged in & not pro */}
          {user && !user.isPro && (
            <button
              onClick={onSubscribe}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-all duration-150 shadow-sm"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Upgrade
            </button>
          )}

          {/* Pro badge */}
          {user?.isPro && (
            <div className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg
              ${dark ? "bg-amber-900/30 border border-amber-700 text-amber-400" : "bg-amber-50 border border-amber-200 text-amber-700"}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Pro
            </div>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(!dark)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200
              ${dark
                ? "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white"
                : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
              }`}
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
            <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
          </button>

          {/* Auth: Login or Avatar */}
          {!user ? (
            <button
              onClick={onLogin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200
                ${dark
                  ? "bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700"
                  : "bg-white border-stone-300 text-stone-700 hover:bg-stone-50"
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign in
            </button>
          ) : (
            <div className="relative group">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 ring-2 ring-offset-1
                  ${dark
                    ? "bg-violet-700 text-white ring-violet-500 ring-offset-stone-950"
                    : "bg-violet-600 text-white ring-violet-300 ring-offset-white"
                  }`}
              >
                {initials}
              </button>
              {/* Dropdown */}
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50
                ${dark ? "bg-stone-900 border-stone-700 shadow-stone-950" : "bg-white border-stone-200 shadow-stone-200"}`}>
                <div className={`px-3.5 py-2.5 border-b ${dark ? "border-stone-800" : "border-stone-100"}`}>
                  <p className={`text-xs font-semibold truncate ${dark ? "text-stone-200" : "text-stone-800"}`}>{user.name}</p>
                  <p className={`text-xs truncate ${dark ? "text-stone-500" : "text-stone-400"}`}>{user.email}</p>
                </div>
                <button
                  onClick={onSubscribe}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-colors duration-100
                    ${dark ? "text-stone-300 hover:bg-stone-800" : "text-stone-600 hover:bg-stone-50"}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Subscription & Plans
                </button>
                <button
                  onClick={onLogout}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-colors duration-100
                    ${dark ? "text-stone-400 hover:bg-stone-800" : "text-stone-500 hover:bg-stone-50"}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}