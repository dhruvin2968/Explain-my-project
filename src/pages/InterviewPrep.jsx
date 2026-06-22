import { useState } from 'react';
import { Mic, BrainCircuit, FileText, LineChart } from 'lucide-react';

const FEATURES = [
  {
    icon: <Mic />,
    color: "#F5A623",
    title: "Real-Time Voice Simulations",
    desc: "Converse naturally with our AI interviewer. Practice speaking aloud and get comfortable with live interactions.",
  },
  {
    icon: <BrainCircuit />,
    color: "#4ECDC4",
    title: "Dynamic, Unscripted Questions",
    desc: "No two interviews are the same. The AI listens and asks intelligent follow-up questions to test your depth.",
  },
  {
    icon: <FileText />,
    color: "#A78BFA",
    title: "Resume-Tailored Scenarios",
    desc: "The AI reads your resume to grill you specifically on your past projects, tech stack, and career history.",
  },
  {
    icon: <LineChart />,
    color: "#FF6B6B",
    title: "Instant Analytics & Feedback",
    desc: "After each session, get a detailed breakdown of pacing, confidence, keyword usage, and areas to improve.",
  },
];

const MOCK_LINES = [
  "◉ REC  Interview — Senior SDE @ Razorpay",
  "",
  "Interviewer: You mentioned Socket.io —",
  "  how would you scale this to 10,000 users?",
  "",
  "You: [speaking…]",
  "",
  "⏱ 00:43  [tap to end answer]",
  "",
  "Feedback: Strong on horizontal scaling,",
  "  missed Redis pub/sub for cross-server sync.",
];

export default function InterviewPrep({ dark }) {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  const bg       = dark ? "#050505" : "#f5f5f0";
  const cardBg   = dark ? "#0d0d0d" : "#ffffff";
  const border   = dark ? "#1a1a1a" : "#e5e5e5";
  const textMain = dark ? "#f0f0f0" : "#0a0a0a";
  const textSub  = dark ? "#666"    : "#888";
  const inputBg  = dark ? "#111"    : "#ebebeb";

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) { setSubmitted(true); setEmail(''); }
  };

  return (
    <div style={{ background: bg, minHeight: "100vh", color: textMain, fontFamily: "'DM Sans', sans-serif", transition: "background 0.3s, color 0.3s" }}>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10rem", right: "-10rem", width: "28rem", height: "28rem", borderRadius: "50%", filter: "blur(90px)", background: "rgba(245,166,35,0.07)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "-8rem", width: "20rem", height: "20rem", borderRadius: "50%", filter: "blur(80px)", background: "rgba(78,205,196,0.06)" }} />
      </div>

      {/* ── Hero ── */}
      <section style={{ position: "relative", zIndex: 10, maxWidth: 760, margin: "0 auto", padding: "72px 32px 60px", textAlign: "center" }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid rgba(245,166,35,0.4)`, borderRadius: 99, padding: "5px 14px", marginBottom: 32, fontSize: 11, color: "#F5A623", fontFamily: "'JetBrains Mono', monospace", background: "rgba(245,166,35,0.08)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F5A623", display: "inline-block", animation: "blink 1.2s infinite" }} />
          02 — Mock Interview · Coming Soon
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(30px, 5vw, 58px)", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20, color: textMain }}>
          Master the interview,<br />
          <span style={{ color: "#F5A623" }}>before you step in the room.</span>
        </h1>

        <p style={{ fontSize: 16, color: textSub, maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.75 }}>
          AI-powered mock interviews with real-time voice, project-specific questions, and brutally honest feedback — right in your browser.
        </p>

        {/* Waitlist form */}
        <form onSubmit={handleNotify} style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", maxWidth: 460, margin: "0 auto 16px" }}>
          <input
            type="email"
            placeholder="your@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: "12px 16px", background: inputBg, border: `1px solid ${border}`, borderRadius: 8, fontSize: 14, color: textMain, outline: "none", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s" }}
          />
          <button
            type="submit"
            style={{ padding: "12px 28px", background: "#F5A623", color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}
          >
            {submitted ? "You're on the list ✓" : "Notify Me →"}
          </button>
        </form>
        <p style={{ fontSize: 12, color: dark ? "#444" : "#bbb" }}>No spam. We'll ping you when it launches.</p>
      </section>

      {/* ── Terminal mock ── */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px 80px", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 24px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.9, color: "#666" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
            <span style={{ marginLeft: 8, fontSize: 11, color: "#333" }}>prepnpitch — interview-sim</span>
          </div>
          {MOCK_LINES.map((line, i) => (
            <div key={i} style={{
              color: line.startsWith("◉") || line.startsWith("Interviewer") ? "#eee"
                : line.startsWith("Feedback") ? "#F5A623"
                : line.startsWith("You") ? "#4ECDC4"
                : line.startsWith("⏱") ? "#888"
                : undefined,
              whiteSpace: "pre",
            }}>
              {line || "\u00A0"}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ borderTop: `1px solid ${border}`, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px" }}>

          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#F5A623", fontFamily: "'JetBrains Mono', monospace", marginBottom: 14, textTransform: "uppercase" }}>
              What you'll get on day one
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 36px)", color: textMain, marginBottom: 0 }}>
              Built to stress-test you.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "28px 24px", transition: "border-color 0.2s" }}>
                <div style={{ width: 44, height: 44, background: dark ? "#111" : "#f0f0f0", border: `1px solid ${border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 8, color: textMain }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: textSub, lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}