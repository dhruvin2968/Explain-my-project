import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
const NAV_ITEMS = [
  { id: "explain", label: "ExplainMyProject" },
  { id: "interview", label: "Interview Prep" },
  { id: "resume", label: "Resume Checker" },
  { id: "jobmatch", label: "Job Match" },
];
const FEATURES = [
  {
    id: "explain",
    tag: "01 — ExplainMyProject",
    headline: "Turn your GitHub into\na story that lands.",
    body: "Paste your repo link. We read your code, understand your architecture, and generate crisp answers to every \"tell me about your project\" question — tailored to the role you're applying for.",
    bullets: [
      "Auto-reads README, stack, and core files",
      "Generates STAR-format project narratives",
      "Handles system design follow-up questions",
      "Exports as PDF or shareable link",
    ],
    accent: "#F5A623",
    mockLines: [
      "> analyzing github.com/dhruv/colab-tool",
      "> detected: React · Socket.io · Firebase · Judge0",
      "> building project narrative...",
      "",
      "Q: Walk me through your biggest technical challenge.",
      "A: Real-time cursor sync across 50+ concurrent users",
      "   was the hardest part. I used Socket.io rooms with",
      "   operational transforms to resolve edit conflicts...",
    ],
  },
  {
    id: "interview",
    tag: "02 — Interview Prep",
    headline: "Mock interviews that\nactually stress-test you.",
    body: "AI interviewer asks questions specific to your project, your stack, and the company's engineering culture. Voice-enabled. Gives brutal, honest feedback after each answer.",
    bullets: [
      "Project-specific technical deep-dives",
      "Voice mode with real-time transcription",
      "Post-session feedback with gap analysis",
      "Company-specific question banks",
    ],
    accent: "#4ECDC4",
    mockLines: [
      "◉ REC  Interview — Senior SDE @ Razorpay",
      "",
      "Interviewer: You mentioned using Socket.io —",
      "  how would you scale this to 10,000 users?",
      "",
      "You: [speaking...]",
      "",
      "⏱ 00:43  [tap to end answer]",
      "",
      "Feedback: Strong on horizontal scaling, missed",
      "  Redis pub/sub for cross-server broadcasting.",
    ],
  },
  {
    id: "resume",
    tag: "03 — Resume Checker",
    headline: "Your resume has\nsilent killers. We find them.",
    body: "Upload your resume. We run it through ATS simulators, keyword density checks, and readability scoring — then rewrite the weak lines for you.",
    bullets: [
      "ATS compatibility score out of 100",
      "Missing keyword detection per job role",
      "Rewrites weak bullet points instantly",
      "Formats for FAANG, startup, and service company patterns",
    ],
    accent: "#FF6B6B",
    mockLines: [
      "Resume Analysis — Dhruv_Resume_2025.pdf",
      "",
      "ATS Score       ████████░░  78/100",
      "Keyword Match   ██████░░░░  61/100",
      "Impact Clarity  █████████░  88/100",
      "",
      "⚠ Weak bullet detected:",
      "  'Worked on backend services'",
      "",
      "✓ Suggested rewrite:",
      "  'Reduced API latency by 40% by migrating",
      "   sync DB calls to async event queues'",
    ],
  },
  {
    id: "jobmatch",
    tag: "04 — Job Match Score",
    headline: "Know your odds before\nyou hit apply.",
    body: "Paste any job description. We compare it against your resume and projects to give you a match score, skill gaps to close, and a custom prep plan for that specific role.",
    bullets: [
      "Match score per JD in seconds",
      "Skill gap list with learning resources",
      "Custom interview prep plan per role",
      "Tracks applications and prep progress",
    ],
    accent: "#A78BFA",
    mockLines: [
      "Job: Backend Engineer — Razorpay Payments",
      "Profile: Dhruv Sharma",
      "",
      "Overall Match    ████████░░  82%",
      "",
      "✓ Strong: Node.js, REST APIs, Firebase",
      "✓ Strong: System design, Microservices",
      "△ Gap: Redis / caching layer",
      "△ Gap: Payment gateway internals",
      "",
      "Prep plan: 3 topics · est. 6 hrs",
      "[Start prep →]",
    ],
  },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    desc: "Get started, no card needed.",
    features: ["3 project explanations/mo", "5 resume checks/mo", "Basic interview questions", "Job match (2/mo)"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/month",
    desc: "For serious job seekers.",
    features: ["Unlimited project explanations", "Unlimited resume checks", "Voice mock interviews", "Unlimited job matching", "PDF exports", "Priority support"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Annual",
    price: "₹999",
    period: "/year",
    desc: "Save ₹789 vs monthly.",
    features: ["Everything in Pro", "Early access to new features", "Interview question bank", "Application tracker"],
    cta: "Best value",
    highlight: false,
  },
];

function TerminalBlock({ lines, accent }) {
  const [visible, setVisible] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    setVisible(0);
    const timer = setInterval(() => {
      setVisible((v) => {
        if (v >= lines.length) { clearInterval(timer); return v; }
        return v + 1;
      });
    }, 80);
    return () => clearInterval(timer);
  }, [lines]);

  return (
    <div ref={ref} style={{
      background: "#0a0a0a",
      border: "1px solid #222",
      borderRadius: "8px",
      padding: "20px 24px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "13px",
      lineHeight: "1.8",
      color: "#888",
      minHeight: "220px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 11, color: "#444" }}>prepnpitch — terminal</span>
      </div>
      {lines.slice(0, visible).map((line, i) => (
        <div key={i} style={{
          color: line.startsWith("Q:") || line.startsWith("✓") ? accent
            : line.startsWith("⚠") || line.startsWith("△") ? "#FF6B6B"
            : line.startsWith(">") || line.startsWith("◉") ? "#eee"
            : line === "" ? undefined : "#888",
          whiteSpace: "pre",
        }}>
          {line || "\u00A0"}
        </div>
      ))}
      {visible < lines.length && (
        <span style={{ color: accent, animation: "blink 1s infinite" }}>█</span>
      )}
    </div>
  );
}

function FeatureSection({ feature, index }) {
  const isEven = index % 2 === 0;
  return (
    <section
      id={feature.id}
      style={{
        padding: "100px 0",
        borderTop: "1px solid #1a1a1a",
        scrollMarginTop: "70px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "center",
          flexDirection: isEven ? "row" : "row-reverse",
        }}>
          <div style={{ order: isEven ? 0 : 1 }}>
            <div style={{
              display: "inline-block",
              fontSize: "11px",
              letterSpacing: "0.15em",
              color: feature.accent,
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: "20px",
              textTransform: "uppercase",
            }}>
              {feature.tag}
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#f0f0f0",
              lineHeight: 1.15,
              marginBottom: "24px",
              whiteSpace: "pre-line",
            }}>
              {feature.headline}
            </h2>
            <p style={{
              fontSize: "16px",
              color: "#666",
              lineHeight: 1.8,
              marginBottom: "32px",
              maxWidth: 420,
            }}>
              {feature.body}
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {feature.bullets.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px", color: "#aaa" }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: feature.accent,
                    marginTop: 7, flexShrink: 0,
                  }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ order: isEven ? 1 : 0 }}>
            <TerminalBlock lines={feature.mockLines} accent={feature.accent} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({ dark }) {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const routeMap = {
      explain:   "/explain",
      interview: "/interviewprep",
      resume:    "/resumecheck",
      jobmatch:  "/job",
    };
    navigate(routeMap[id]);
  };

  return (
    <div style={{
      background: dark ? "#050505" : "#f5f5f0",
      minHeight: "100vh",
      color: dark ? "#f0f0f0" : "#0a0a0a",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        .nav-link { background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 6px 14px; border-radius: 6px; transition: all 0.2s; letter-spacing: 0.01em; }
        .nav-link:hover { background: #111; }
        .cta-primary { background: #F5A623; color: #000; border: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; letter-spacing: 0.01em; }
        .cta-primary:hover { background: #e8961a; transform: translateY(-1px); }
        .cta-ghost { background: transparent; color: #888; border: 1px solid #222; padding: 14px 32px; border-radius: 6px; font-size: 15px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .cta-ghost:hover { border-color: #444; color: #ccc; }
        .plan-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 12px; padding: 32px; transition: border-color 0.2s; }
        .plan-card:hover { border-color: #333; }
        .plan-card.highlight { border-color: #F5A623; background: #0f0d09; }
        @media (max-width: 768px) {
          .feature-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .hero-headline { font-size: 38px !important; }
          .nav-items { display: none; }
        }
      `}</style>
      {/* HERO */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "120px 32px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)",
          animation: "glow 4s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />

        <div style={{ animation: "fadeUp 0.8s ease both", animationDelay: "0.1s", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: "1px solid #1e1e1e", borderRadius: "99px",
            padding: "6px 14px", marginBottom: "40px",
            fontSize: "12px", color: "#666",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ECDC4", display: "inline-block" }} />
            Built for developers who interview seriously
          </div>

          <h1 className="hero-headline" style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(40px, 7vw, 80px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "28px",
            color: "#f0f0f0",
            maxWidth: 800,
          }}>
            Stop winging your{" "}
            <span style={{ color: "#F5A623" }}>tech interviews.</span>
          </h1>

          <p style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "#555",
            maxWidth: 520,
            lineHeight: 1.7,
            marginBottom: "48px",
            margin: "0 auto 48px",
          }}>
            PrepNPitch turns your projects, resume, and target roles into a complete interview system — powered by AI that knows what interviewers actually ask.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/explain")} className="cta-primary">Start for free →</button>
            <button className="cta-ghost">See how it works</button>
          </div>

          <div style={{ marginTop: "60px", display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap" }}>
            {["GitHub repo scanning", "Voice mock interviews", "ATS resume check", "Job match scoring"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#444" }}>
                <span style={{ color: "#F5A623", fontSize: 16 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE SECTIONS */}
      {FEATURES.map((feature, i) => (
        <FeatureSection key={feature.id} feature={feature} index={i} />
      ))}

      {/* PRICING */}
      <section style={{ padding: "100px 0", borderTop: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{
              fontSize: "11px", letterSpacing: "0.15em", color: "#F5A623",
              fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px",
              textTransform: "uppercase",
            }}>Pricing</div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 44px)", color: "#f0f0f0", marginBottom: "16px",
            }}>
              One tool. All your prep.
            </h2>
            <p style={{ color: "#555", fontSize: "16px" }}>Cancel anytime. No hidden fees.</p>
          </div>

          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
            {PLANS.map((plan) => (
              <div key={plan.name} className={`plan-card${plan.highlight ? " highlight" : ""}`}>
                {plan.highlight && (
                  <div style={{
                    display: "inline-block", background: "#F5A623", color: "#000",
                    fontSize: "11px", fontWeight: 700, padding: "3px 10px",
                    borderRadius: "4px", marginBottom: "16px", letterSpacing: "0.05em",
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "18px", marginBottom: "6px" }}>
                  {plan.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 700, fontFamily: "Syne", color: plan.highlight ? "#F5A623" : "#f0f0f0" }}>
                    {plan.price}
                  </span>
                  <span style={{ color: "#555", fontSize: "14px" }}>{plan.period}</span>
                </div>
                <p style={{ color: "#555", fontSize: "13px", marginBottom: "24px" }}>{plan.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ fontSize: "13px", color: "#888", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ color: plan.highlight ? "#F5A623" : "#444", marginTop: "1px" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button style={{
                  width: "100%", padding: "12px",
                  background: plan.highlight ? "#F5A623" : "transparent",
                  color: plan.highlight ? "#000" : "#666",
                  border: plan.highlight ? "none" : "1px solid #222",
                  borderRadius: "6px", fontSize: "14px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{
        padding: "100px 32px", textAlign: "center",
        borderTop: "1px solid #1a1a1a", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 500, height: 200,
          background: "radial-gradient(ellipse, rgba(245,166,35,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: "clamp(28px, 5vw, 56px)",
          color: "#f0f0f0", marginBottom: "20px",
          letterSpacing: "-0.02em",
        }}>
          Your next offer starts here.
        </h2>
        <p style={{ color: "#555", fontSize: "16px", marginBottom: "36px" }}>
          Join developers who stopped guessing and started preparing.
        </p>
        <button className="cta-primary" style={{ padding: "16px 40px", fontSize: "16px" }} onClick={() => navigate("/explain")}>
          Get started free →
        </button>
      </section>

      {/* FOOTER */}
      
    </div>
  );
}