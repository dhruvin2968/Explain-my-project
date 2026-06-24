import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase/config';

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

export default function App() {
  const [dark, setDark]           = useState(true);
  const [user, setUser]           = useState(null);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ name: firebaseUser.displayName, email: firebaseUser.email, uid: firebaseUser.uid, isPro: false });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login error:", err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err.message);
    }
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
          onSubscribe={() => setShowPricing(true)}
        />

        <main className="flex-grow pt-[64px]">
          <Routes>
            <Route path="/"            element={<LandingPage    dark={dark} onSubscribe={() => setShowPricing(true)} />} />
            <Route path="/explain"     element={<ExplainMyProject dark={dark} onSubscribe={() => setShowPricing(true)} />} />
            <Route path="/interviewprep" element={<InterviewPrep dark={dark} user={user} onLogin={handleLogin} />} />
            <Route path="/resumecheck" element={<ResumeChecker  dark={dark} setDark={setDark} user={user} onLogin={handleLogin} onSubscribe={() => setShowPricing(true)} />} />
            <Route path="/jobmatch"    element={<JobMatch        dark={dark} setDark={setDark} user={user} onLogin={handleLogin} onSubscribe={() => setShowPricing(true)} />} />
            <Route path="/findjobs"    element={<FindJobs        dark={dark} user={user} onLogin={handleLogin} onSubscribe={() => setShowPricing(true)} />} />
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
            onSuccess={(planId) => {
              console.log("Plan purchased:", planId);
              setShowPricing(false);
            }}
          />
        )}
      </div>
    </BrowserRouter>
  );
}