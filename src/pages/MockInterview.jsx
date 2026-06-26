import { useState, useRef, useEffect, useCallback } from 'react';
import { auth } from '../firebase/config';

const API = import.meta.env.VITE_API_URL;

async function getToken() {
  try { return (await auth.currentUser?.getIdToken()) || null; } catch { return null; }
}

const VERDICT_STYLE = {
  Strong:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.35)'  },
  Good:    { color: '#4ECDC4', bg: 'rgba(78,205,196,0.12)',  border: 'rgba(78,205,196,0.35)' },
  Average: { color: '#F5A623', bg: 'rgba(245,166,35,0.12)',  border: 'rgba(245,166,35,0.35)' },
  Weak:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)'  },
};

export default function MockInterview({ dark, user, onLogin, onSubscribe }) {
  const bg       = dark ? '#050505' : '#f5f5f0';
  const cardBg   = dark ? '#0d0d0d' : '#ffffff';
  const border   = dark ? '#1a1a1a' : '#e5e5e5';
  const textMain = dark ? '#f0f0f0' : '#0a0a0a';
  const textSub  = dark ? '#666'   : '#888';
  const inputBg  = dark ? '#111'   : '#ebebeb';

  // phase: 'setup' | 'loading' | 'interview' | 'report'
  const [phase, setPhase]               = useState('setup');
  const [role, setRole]                 = useState('');
  const [level, setLevel]               = useState('Mid-level');
  const [techStack, setTechStack]       = useState('');
  const [questions, setQuestions]       = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript]     = useState('');
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [answered, setAnswered]         = useState(false);
  const [qa, setQa]                     = useState([]);
  const [report, setReport]             = useState(null);
  const [error, setError]               = useState('');
  const [loadingText, setLoadingText]   = useState('');

  const recognitionRef = useRef(null);
  const synthRef       = useRef(null);
  const qaRef          = useRef([]);

  // iOS (Safari + Chrome on iOS) doesn't support SpeechRecognition
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
  }, []);

  const speak = useCallback((text) => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = 0.93;
    utter.pitch = 1;
    const voices = synth.getVoices();
    const pref = voices.find(v =>
      v.name.includes('Google UK English Female') ||
      v.name.includes('Samantha') ||
      v.name.includes('Karen')
    );
    if (pref) utter.voice = pref;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend   = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    synth.speak(utter);
  }, []);

  useEffect(() => {
    if (phase === 'interview' && questions[currentIndex]) {
      setAnswered(false);
      setTranscript('');
      speak(questions[currentIndex]);
    }
  }, [phase, currentIndex]); // eslint-disable-line

  useEffect(() => {
    return () => {
      synthRef.current?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Voice input requires Chrome or Edge. You can also type your answer below.'); return; }
    synthRef.current?.cancel();
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      }
      if (final) setTranscript(prev => prev + final);
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const handleStart = async () => {
    if (!role.trim()) { setError('Please enter a target role.'); return; }
    if (!user) { onLogin(); return; }
    setError('');
    setLoadingText('Preparing your interview questions...');
    setPhase('loading');
    try {
      const token = await getToken();
      const res = await fetch(`${API}/mock-interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ role: role.trim(), level, techStack: techStack.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'NO_CREDITS') { onSubscribe?.(); setPhase('setup'); return; }
        throw new Error(data.error || 'Failed to start. Try again.');
      }
      qaRef.current = [];
      setQa([]); setReport(null); setAnswered(false); setCurrentIndex(0);
      setQuestions(data.questions);
      setPhase('interview');
    } catch (err) { setError(err.message); setPhase('setup'); }
  };

  const handleSubmitAnswer = () => {
    const answer = transcript.trim();
    if (answer.length < 10) { setError('Please give a more complete answer before continuing.'); return; }
    stopListening();
    synthRef.current?.cancel();
    setError('');
    const entry = { q: questions[currentIndex], a: answer };
    const newQa = [...qaRef.current, entry];
    qaRef.current = newQa;
    setQa(newQa);
    setAnswered(true);
  };

  const handleNext = async () => {
    const isLast = currentIndex + 1 >= questions.length;
    if (!isLast) { setCurrentIndex(i => i + 1); return; }
    setLoadingText('Analysing your interview and generating your report...');
    setPhase('loading');
    try {
      const token = await getToken();
      const res = await fetch(`${API}/mock-interview/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ role, level, qa: qaRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Report generation failed.');
      setReport(data);
      setPhase('report');
    } catch (err) { setError(err.message); setAnswered(true); setPhase('interview'); }
  };

  const downloadReport = () => {
    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const verdictColor = { Strong: '#16a34a', Good: '#0d9488', Average: '#d97706', Weak: '#dc2626' };

    const breakdownRows = qa.map((item, i) => {
      const bd = (report.breakdown || [])[i] || {};
      const vc = verdictColor[bd.verdict] || '#666';
      return `
        <div class="qa-item">
          <div class="qa-header">
            <span class="q-label">Q${i + 1}</span>
            <div class="q-score">
              <span class="score-num">${bd.score ?? '—'}/10</span>
              <span class="verdict-badge" style="background:${vc}22;color:${vc};border:1px solid ${vc}55">${bd.verdict || ''}</span>
            </div>
          </div>
          <p class="q-text">${item.q}</p>
          <p class="q-feedback">${bd.feedback || ''}</p>
          ${bd.tip ? `<p class="q-tip">&#128161; ${bd.tip}</p>` : ''}
        </div>`;
    }).join('');

    const studyRows = (report.studyTopics || []).map((t, i) => `
      <div class="study-item">
        <span class="study-num">${i + 1}</span>
        <div><strong>${t.topic}</strong><br/><span style="color:#555">${t.reason}</span></div>
      </div>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Interview Report – ${role} – PrepNPitch</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#111;padding:40px 32px}
  .brand{font-size:11px;font-weight:700;letter-spacing:0.15em;color:#F5A623;text-transform:uppercase;margin-bottom:6px}
  h1{font-size:24px;font-weight:700;margin-bottom:4px}
  .meta{font-size:13px;color:#777;margin-bottom:32px}
  .score-row{display:flex;align-items:center;gap:32px;margin-bottom:28px;padding:20px 24px;background:#fafaf7;border-radius:10px;border:1px solid #ebebeb}
  .score-big{font-size:48px;font-weight:700;color:#F5A623;line-height:1}
  .grade-badge{display:inline-block;padding:5px 16px;background:#fff7e6;border:1px solid #F5A623;border-radius:99px;font-size:20px;font-weight:700;color:#F5A623}
  .summary{font-size:14px;line-height:1.75;color:#333;margin-bottom:28px;padding:16px 20px;background:#fafaf7;border-radius:8px;border:1px solid #ebebeb}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
  .card{padding:18px 20px;border-radius:10px;border:1px solid #e8e8e3}
  .card-title{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px}
  .card ul{padding-left:16px}
  .card li{font-size:13px;line-height:1.65;margin-bottom:5px;color:#333}
  .section-title{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin-bottom:14px}
  .study-item{display:flex;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;align-items:flex-start}
  .study-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
  .study-num{min-width:24px;height:24px;border-radius:50%;background:#e0f7f5;color:#0d9488;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .study-item strong{font-size:13px;display:block;margin-bottom:2px}
  .qa-item{margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid #f0f0f0}
  .qa-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
  .qa-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
  .q-label{font-size:11px;font-family:monospace;color:#999}
  .q-score{display:flex;align-items:center;gap:7px}
  .score-num{font-size:13px;font-weight:700}
  .verdict-badge{padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}
  .q-text{font-size:13px;font-weight:600;color:#222;line-height:1.55;margin-bottom:4px}
  .q-feedback{font-size:12px;color:#555;line-height:1.6;margin-bottom:3px}
  .q-tip{font-size:12px;color:#b45309;line-height:1.6}
  .footer{margin-top:36px;text-align:center;font-size:11px;color:#bbb;border-top:1px solid #f0f0f0;padding-top:20px}
  @media print{
    body{padding:24px}
    @page{margin:1.5cm}
  }
</style>
</head>
<body>
  <div class="brand">PrepNPitch</div>
  <h1>Interview Performance Report</h1>
  <div class="meta">${level} &bull; ${role} &bull; ${date}</div>

  <div class="score-row">
    <div>
      <div style="font-size:11px;color:#999;margin-bottom:5px;letter-spacing:0.05em;text-transform:uppercase">Overall Score</div>
      <div class="score-big">${report.overallScore}<span style="font-size:20px;color:#999;font-weight:400">/100</span></div>
    </div>
    <div>
      <div style="font-size:11px;color:#999;margin-bottom:5px;letter-spacing:0.05em;text-transform:uppercase">Grade</div>
      <div class="grade-badge">${report.grade}</div>
    </div>
  </div>

  <p class="summary">${report.summary}</p>

  <div class="two-col">
    <div class="card" style="border-color:#dcfce7">
      <div class="card-title" style="color:#16a34a">Strengths</div>
      <ul>${(report.strengths || []).map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="card" style="border-color:#fee2e2">
      <div class="card-title" style="color:#dc2626">Areas to Improve</div>
      <ul>${(report.improvements || []).map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
  </div>

  ${studyRows ? `<div class="card" style="margin-bottom:20px"><div class="section-title" style="color:#0d9488">Study Plan</div>${studyRows}</div>` : ''}

  <div class="card">
    <div class="section-title">Question Breakdown</div>
    ${breakdownRows}
  </div>

  <div class="footer">Generated by PrepNPitch &bull; ${date}</div>
</body>
</html>`;

    // Render in a hidden iframe and trigger browser print → Save as PDF
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', top: '-9999px', left: '-9999px', width: '1px', height: '1px', border: 'none' });
    document.body.appendChild(iframe);
    const iDoc = iframe.contentDocument || iframe.contentWindow.document;
    iDoc.open(); iDoc.write(html); iDoc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  };

  const handleReset = () => {
    synthRef.current?.cancel(); recognitionRef.current?.stop();
    qaRef.current = [];
    setPhase('setup'); setQuestions([]); setCurrentIndex(0); setTranscript('');
    setAnswered(false); setQa([]); setReport(null); setError('');
    setIsListening(false); setIsSpeaking(false);
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', color: textMain, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s, color 0.3s' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '28rem', height: '28rem', borderRadius: '50%', filter: 'blur(90px)', background: 'rgba(245,166,35,0.07)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '-8rem', width: '20rem', height: '20rem', borderRadius: '50%', filter: 'blur(80px)', background: 'rgba(78,205,196,0.06)' }} />
      </div>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px', position: 'relative', zIndex: 10 }}>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14, color: '#ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {error}<button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 0 0 12px' }}>x</button>
          </div>
        )}

        {phase === 'setup' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(245,166,35,0.4)', borderRadius: 99, padding: '5px 14px', marginBottom: 28, fontSize: 11, color: '#F5A623', fontFamily: "'JetBrains Mono', monospace", background: 'rgba(245,166,35,0.08)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5A623', display: 'inline-block' }} />
                AI Mock Interview · Voice Enabled
              </div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 4vw, 42px)', lineHeight: 1.15, marginBottom: 14 }}>
                Practice like it's<br /><span style={{ color: '#F5A623' }}>the real thing.</span>
              </h1>
              <p style={{ color: textSub, fontSize: 15, maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.75 }}>
                A live AI interviewer asks 7 tailored questions — starting with "Tell me about yourself." Answer by voice or text. Get a full performance report with per-question scores at the end.
              </p>

              {/* Feature pills */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { icon: '🎙️', label: 'Interviewer voice' },
                  { icon: '🎤', label: 'Speak your answers' },
                  { icon: '📊', label: 'Scored feedback' },
                  { icon: '📄', label: 'Download PDF report' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: dark ? '#0d0d0d' : '#ffffff', border: `1px solid ${border}`, borderRadius: 99, fontSize: 12, color: textSub }}>
                    <span>{f.icon}</span>{f.label}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '36px 32px', maxWidth: 540, margin: '32px auto 0' }}>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textSub, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Target Role *</label>
                <input type="text" placeholder="e.g. Frontend SDE, Backend Engineer, Full Stack Developer" value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleStart()} style={{ width: '100%', padding: '12px 14px', background: inputBg, border: `1px solid ${border}`, borderRadius: 8, fontSize: 14, color: textMain, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textSub, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Experience Level</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Junior', 'Mid-level', 'Senior'].map(l => (
                    <button key={l} onClick={() => setLevel(l)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: level === l ? '#F5A623' : inputBg, color: level === l ? '#000' : textSub, border: `1px solid ${level === l ? '#F5A623' : border}`, fontFamily: "'DM Sans', sans-serif" }}>{l}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 30 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textSub, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Your Tech Stack <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input type="text" placeholder="e.g. React, Node.js, MongoDB, TypeScript" value={techStack} onChange={e => setTechStack(e.target.value)} style={{ width: '100%', padding: '12px 14px', background: inputBg, border: `1px solid ${border}`, borderRadius: 8, fontSize: 14, color: textMain, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
              </div>
              {!user
                ? <button onClick={onLogin} style={{ width: '100%', padding: '14px', background: '#F5A623', color: '#000', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Sign in to Start</button>
                : <button onClick={handleStart} style={{ width: '100%', padding: '14px', background: '#F5A623', color: '#000', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Start Interview</button>
              }
              {isIOS && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 8, fontSize: 12, color: '#F5A623', lineHeight: 1.6, textAlign: 'center' }}>
                  ⚠️ Voice input isn't supported on iOS. You can still type your answers — everything else works fine.
                </div>
              )}
              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: dark ? '#444' : '#bbb' }}>Uses 1 credit · Interviewer voice works in Chrome &amp; Edge</p>
            </div>
          </div>
        )}

        {phase === 'loading' && (
          <div style={{ textAlign: 'center', padding: '120px 0' }}>
            <div style={{ width: 48, height: 48, border: `3px solid ${border}`, borderTopColor: '#F5A623', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
            <p style={{ color: textSub, fontSize: 15 }}>{loadingText}</p>
          </div>
        )}

        {phase === 'interview' && questions.length > 0 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: textSub, fontFamily: "'JetBrains Mono', monospace" }}>Question {currentIndex + 1} of {questions.length}</span>
                <span style={{ fontSize: 12, color: textSub }}>{role} - {level}</span>
              </div>
              <div style={{ height: 3, background: border, borderRadius: 99 }}>
                <div style={{ height: '100%', background: '#F5A623', borderRadius: 99, width: `${((currentIndex + 1) / questions.length) * 100}%`, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {questions.map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', transition: 'background 0.2s', background: i < currentIndex ? '#22c55e' : i === currentIndex ? '#F5A623' : border }} />
                ))}
              </div>
            </div>

            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '28px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  🎙️
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textMain }}>AI Interviewer</div>
                  {isSpeaking ? (
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', marginTop: 4, height: 16 }}>
                      {[0,1,2,3].map(i => <div key={i} style={{ width: 3, background: '#F5A623', borderRadius: 99, animation: `wave 0.7s ${i * 0.12}s ease-in-out infinite alternate`, height: '100%' }} />)}
                      <span style={{ fontSize: 11, color: textSub, marginLeft: 6 }}>speaking...</span>
                    </div>
                  ) : (
                    <button onClick={() => speak(questions[currentIndex])} style={{ fontSize: 11, color: '#F5A623', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 3 }}>
                      replay question
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: textMain, margin: 0 }}>{questions[currentIndex]}</p>
            </div>

            {!answered ? (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: textSub }}>Your Answer</span>
                  {isIOS ? (
                    <span style={{ fontSize: 11, color: textSub, padding: '5px 10px', background: dark ? '#111' : '#f0f0f0', borderRadius: 6 }}>⌨️ Type below</span>
                  ) : !isListening
                    ? <button onClick={startListening} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.4)', borderRadius: 8, fontSize: 13, color: '#F5A623', cursor: 'pointer', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>🎤 Speak</button>
                    : <button onClick={stopListening} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, fontSize: 13, color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", animation: 'pulse 1.2s infinite' }}>Stop</button>
                  }
                </div>
                <textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Speak using the mic above, or type your answer here..." rows={5} style={{ width: '100%', padding: '12px 14px', background: inputBg, border: `1px solid ${border}`, borderRadius: 8, fontSize: 14, color: textMain, outline: 'none', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.65 }} />
                {isListening && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#ef4444' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'blink 1s infinite' }} />
                    Listening... speak clearly
                  </div>
                )}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSubmitAnswer} disabled={transcript.trim().length < 10} style={{ padding: '11px 28px', background: transcript.trim().length < 10 ? (dark ? '#1a1a1a' : '#e0e0e0') : '#F5A623', color: transcript.trim().length < 10 ? textSub : '#000', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: transcript.trim().length < 10 ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}>
                    Submit Answer
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: cardBg, border: '1px solid rgba(34,197,94,0.35)', borderRadius: 14, padding: '22px 28px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#22c55e' }}>✓</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e' }}>Answer recorded</div>
                    <div style={{ fontSize: 12, color: textSub, marginTop: 2 }}>
                      {currentIndex + 1 < questions.length ? `${questions.length - currentIndex - 1} question${questions.length - currentIndex - 1 !== 1 ? 's' : ''} remaining` : 'Last question — ready for your report'}
                    </div>
                  </div>
                </div>
                <button onClick={handleNext} style={{ padding: '10px 24px', background: '#F5A623', color: '#000', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                  {currentIndex + 1 >= questions.length ? 'Get Report' : 'Next'}
                </button>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button onClick={handleReset} style={{ fontSize: 12, color: textSub, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>End session</button>
            </div>
          </div>
        )}

        {phase === 'report' && report && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: '#F5A623', fontFamily: "'JetBrains Mono', monospace", marginBottom: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Interview Complete</div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(22px, 3vw, 34px)', marginBottom: 6 }}>Your Performance Report</h2>
              <p style={{ color: textSub, fontSize: 14 }}>{level} {role}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{ position: 'relative', width: 148, height: 148 }}>
                <svg width="148" height="148" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="74" cy="74" r="60" fill="none" stroke={border} strokeWidth="9" />
                  <circle cx="74" cy="74" r="60" fill="none" stroke="#F5A623" strokeWidth="9" strokeDasharray={`${2 * Math.PI * 60}`} strokeDashoffset={`${2 * Math.PI * 60 * (1 - report.overallScore / 100)}`} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 32, color: textMain, lineHeight: 1 }}>{report.overallScore}</span>
                  <span style={{ fontSize: 12, color: textSub, marginTop: 2 }}>/ 100</span>
                </div>
              </div>
            </div>

            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '24px 28px', marginBottom: 18, textAlign: 'center' }}>
              <span style={{ display: 'inline-block', padding: '4px 20px', background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.35)', borderRadius: 99, fontSize: 20, fontWeight: 700, color: '#F5A623', marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>{report.grade}</span>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: textMain, margin: 0 }}>{report.summary}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 18 }}>
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginBottom: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Strengths</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {(report.strengths || []).map((s, i) => <li key={i} style={{ fontSize: 14, color: textMain, lineHeight: 1.65, marginBottom: 8, paddingLeft: 16, position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: '#22c55e' }}>·</span>{s}</li>)}
                </ul>
              </div>
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Improve</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {(report.improvements || []).map((s, i) => <li key={i} style={{ fontSize: 14, color: textMain, lineHeight: 1.65, marginBottom: 8, paddingLeft: 16, position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: '#ef4444' }}>·</span>{s}</li>)}
                </ul>
              </div>
            </div>

            {(report.studyTopics || []).length > 0 && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4ECDC4', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Study Plan</div>
                {report.studyTopics.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < report.studyTopics.length - 1 ? 14 : 0, paddingBottom: i < report.studyTopics.length - 1 ? 14 : 0, borderBottom: i < report.studyTopics.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#4ECDC4', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: textMain, marginBottom: 3 }}>{t.topic}</div>
                      <div style={{ fontSize: 13, color: textSub, lineHeight: 1.55 }}>{t.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(report.breakdown || []).length > 0 && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: textSub, marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Question Breakdown</div>
                {qa.map((item, i) => {
                  const bd = report.breakdown[i] || {};
                  return (
                    <div key={i} style={{ marginBottom: i < qa.length - 1 ? 18 : 0, paddingBottom: i < qa.length - 1 ? 18 : 0, borderBottom: i < qa.length - 1 ? `1px solid ${border}` : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: textSub, fontFamily: "'JetBrains Mono', monospace" }}>Q{i + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: textMain }}>{bd.score}/10</span>
                          <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: VERDICT_STYLE[bd.verdict]?.bg, color: VERDICT_STYLE[bd.verdict]?.color }}>{bd.verdict}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: textMain, lineHeight: 1.6, marginBottom: 4, fontWeight: 500 }}>{item.q}</p>
                      <p style={{ fontSize: 12, color: textSub, lineHeight: 1.55, margin: 0 }}>{bd.feedback}</p>
                      {bd.tip && <p style={{ fontSize: 12, color: '#F5A623', lineHeight: 1.55, margin: '4px 0 0' }}>Tip: {bd.tip}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={downloadReport}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'transparent', color: textMain, border: `1px solid ${border}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                ↓ Save as PDF
              </button>
              <button onClick={handleReset} style={{ padding: '13px 36px', background: '#F5A623', color: '#000', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Try Again</button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes wave  { from { transform: scaleY(0.35); } to { transform: scaleY(1.3); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.65; } }
      `}</style>
    </div>
  );
}
