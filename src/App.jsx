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
    // 1. Wrap everything in BrowserRouter
    <BrowserRouter>
      {/* 2. Flexbox layout to keep footer at the bottom */}
      <div className={`flex flex-col min-h-screen`} style={{ background: dark ? '#050505' : '#f5f5f0', transition: 'background 0.3s' }}>
        
        {/* 3. Header stays on all pages */}
        <Header 
          dark={dark} 
          setDark={setDark} 
          user={user} 
          onLogin={() => setUser({ name: "Guest User" })} 
        />

        {/* 4. This is where the page content changes based on the URL */}
        <main className="flex-grow pt-[64px]"> {/* pt-[64px] offsets your fixed header */}
          <Routes>
            <Route path="/" element={<LandingPage dark={dark} />} />
            <Route path="/explain" element={<ExplainMyProject dark={dark} />} />
            <Route path="/interviewprep" element={<InterviewPrep dark={dark} />} />
            <Route path="/resumecheck" element={<ResumeChecker dark={dark} setDark={setDark} />} />
            <Route path="/jobmatch" element={<JobMatch dark={dark} setDark={setDark} />} />

            {/* Catch-all for 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* 5. Footer stays on all pages */}
        <Footer dark={dark} />
      </div>
    </BrowserRouter>
  );
}