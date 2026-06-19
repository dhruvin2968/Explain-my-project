import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import your page components here
import LandingPage from "./pages/LandingPage";
import ExplainMyProject from "./pages/ExplainMyProject";
import InterviewPrep from "./pages/InterviewPrep";
import ResumeChecker from "./pages/ResumeChecker";
import JobMatch from "./pages/JobMatch";

export default function AllRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Feature Pages */}
        <Route path="/explain" element={<ExplainMyProject />} />
        <Route path="/interview" element={<InterviewPrep />} />
        <Route path="/resumecheck" element={<ResumeChecker />} />
        <Route path="/jobmatch" element={<JobMatch />} />

        {/* Catch-all route for 404s - redirects to home or a custom 404 page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}