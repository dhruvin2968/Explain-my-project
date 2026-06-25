import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase/config';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import PricingModal from './components/PricingModal';

// Pages
import LandingPage from './pages/LandingPage';
import ExplainMyProject from './pages/ExplainMyProject';
import InterviewPrep from './pages/InterviewPrep';
import ResumeChecker from './pages/ResumeChecker';
import JobMatch from './pages/JobMatch';
import FindJobs from './pages/FindJobs';
import LegalPage from './pages/LegalPage';

const FREE_CREDITS = 5;

async function fetchUserData(firebaseUser) {
  const ref  = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const newUser = {
    name:      firebaseUser.displayName,
    email:     firebaseUser.email,
    plan:      "free",
    credits:   FREE_CREDITS,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, newUser);
  return newUser;
}

export default function App() {
  const [dark, setDark]           = useState(true);
  const [user, setUser]           = useState(null);
  const [credits, setCredits]     = useState(null);
  const [showPricing, setShowPricing] = useState(false);

  const loadUser = async (firebaseUser) => {
    const data = await fetchUserData(firebaseUser);
    const isPro = data.plan && data.plan !== "free";
    setUser({
      name:     firebaseUser.displayName,
      email:    firebaseUser.email,
      uid:      firebaseUser.uid,
      isPro,
    });
    setCredits(isPro ? null : (data.credits ?? 0));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        loadUser(firebaseUser);
      } else {
        setUser(null);
        setCredits(null);
      }
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await loadUser(result.user);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        console.error("Login error:", err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  // Smart "Go Pro": sign in first if not logged in, then open pricing
  const handleGoPro = async () => {
    if (!user) {
      await handleLogin();
    }
    setShowPricing(true);
  };

  const handlePurchaseSuccess = (planId) => {
    if (planId && planId !== "free") {
      setUser((u) => u ? { ...u, isPro: true } : u);
      setCredits(null);
    }
    setShowPricing(false);
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen" style={{ background: dark ? '#050505' : '#f5f5f0', transition: 'background 0.3s' }}>

        <Header
          dark={dark}
          setDark={setDark}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          credits={credits}
          onSubscribe={() => setShowPricing(true)}
        />

        <main className="flex-grow pt-[64px]">
          <Routes>
            <Route path="/"            element={<LandingPage    dark={dark} user={user} onLogin={handleLogin} onSubscribe={handleGoPro} />} />
            <Route path="/explain"     element={<ExplainMyProject dark={dark} onSubscribe={() => setShowPricing(true)} />} />
            <Route path="/interviewprep" element={<InterviewPrep dark={dark} user={user} onLogin={handleLogin} />} />
            <Route path="/resumecheck" element={<ResumeChecker  dark={dark} onLogin={handleLogin} onSubscribe={() => setShowPricing(true)} />} />
            <Route path="/jobmatch"    element={<JobMatch        dark={dark} onLogin={handleLogin} onSubscribe={() => setShowPricing(true)} />} />
            <Route path="/findjobs"    element={<FindJobs        dark={dark} onLogin={handleLogin} onSubscribe={() => setShowPricing(true)} />} />
            <Route path="/privacy"    element={<LegalPage dark={dark} type="privacy" />} />
            <Route path="/terms"      element={<LegalPage dark={dark} type="terms"   />} />
            <Route path="/refund"     element={<LegalPage dark={dark} type="refund"  />} />
            <Route path="/contact"    element={<LegalPage dark={dark} type="contact" />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer dark={dark} />

        {/* Global Pricing Modal */}
        {showPricing && (
          <PricingModal
            dark={dark}
            uid={user?.uid}
            onClose={() => setShowPricing(false)}
            onSuccess={handlePurchaseSuccess}
          />
        )}
      </div>
    </BrowserRouter>
  );
}