import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import ExplainMyProject from './pages/ExplainMyProject';
import InterviewPrep from './pages/InterviewPrep';
import ResumeChecker from './pages/ResumeChecker';
import JobMatch from './pages/JobMatch';

export default function App() {
  // You can lift your theme/user state here if you want it globally available
  const [dark, setDark] = useState(true);
  const [user, setUser] = useState(null); 

  return (
    <BrowserRouter>
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
        user={firebaseUser ? {
          name:  firebaseUser.displayName,
          email: firebaseUser.email,
          isPro,
        } : null}
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
        {firebaseUser && (
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
              disabled={loading || (firebaseUser && !canGenerate)}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none
                ${loading || (firebaseUser && !canGenerate)
                  ? dark ? "bg-stone-800 text-stone-600 cursor-not-allowed" : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : !firebaseUser || !isValid
                    ? dark ? "bg-stone-800 text-stone-400 hover:bg-stone-700 border border-stone-700" : "bg-stone-100 text-stone-500 hover:bg-stone-200 border border-stone-200"
                    : "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.99] shadow-md shadow-violet-900/30"
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
                  //const locked = !isPro && !FREE_UNLOCKED.includes(title);
                  const locked=false;
                  const contentMap = {
                    "Elevator Pitch":            result.elevatorPitch,
                    "Detailed Explanation":      result.detailedExplanation,
                    "Tech Stack Justification":  result.techStackJustification,
                    "Challenges & Solutions":    result.challengesAndSolutions,
                    "Interview Q&A":             result.interviewQA,
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
                  <div className={`rounded-2xl border p-5 text-center
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

        {/* 5. Footer stays on all pages */}
        <Footer dark={dark} />
      </div>
    </BrowserRouter>
);
}
