import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const SLOT_LABELS = {
  "19:00–20:00": { label: "7:00 – 8:00 PM", sub: "Evening slot" },
  "22:00–23:00": { label: "10:00 – 11:00 PM", sub: "Night slot" },
};
const LEVELS = ["Fresher", "1–2 years", "3–5 years", "5+ years"];

function getNext7Days() {
  const days = [];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    days.push({
      iso: `${yyyy}-${mm}-${dd}`,
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    });
  }
  return days;
}

export default function BookInterview({ dark, user, onLogin }) {
  const days = getNext7Days();

  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots]               = useState([]); // [{slot, available}]
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role,  setRole]  = useState('');
  const [level, setLevel] = useState('');

  const [phase, setPhase] = useState('select'); // select | form | paying | done | error
  const [errMsg, setErrMsg] = useState('');

  // Theme
  const bg      = dark ? '#050505' : '#f5f5f0';
  const card    = dark ? '#0d0d0d' : '#ffffff';
  const border  = dark ? '#1e1e1e' : '#e8e8e0';
  const text    = dark ? '#f0f0f0' : '#1a1a1a';
  const textSub = dark ? '#888' : '#666';

  // Fetch slots whenever date changes
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedSlot(null);
    setSlotsLoading(true);
    fetch(`${API_URL}/booking/slots?date=${selectedDate}`)
      .then(r => r.json())
      .then(d => { setSlots(d.slots || []); setSlotsLoading(false); })
      .catch(() => { setSlots([]); setSlotsLoading(false); });
  }, [selectedDate]);

  const canProceed = selectedDate && selectedSlot && name.trim() && email.trim() && role.trim() && level;

  const handlePay = () => {
    if (!canProceed) return;
    setPhase('paying');
    setErrMsg('');

    fetch(`${API_URL}/booking/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, slot: selectedSlot, name, email, role, level }),
    })
      .then(r => r.json())
      .then(async (order) => {
        if (order.error) { setErrMsg(order.error); setPhase('form'); return; }

        try {
          const cashfree = await window.Cashfree({ mode: import.meta.env.VITE_CASHFREE_ENV || 'sandbox' });
          const result = await cashfree.checkout({
            paymentSessionId: order.payment_session_id,
            redirectTarget: '_modal',
          });

          if (result.error) {
            setErrMsg(result.error.message || 'Payment cancelled.');
            setPhase('form');
            return;
          }

          if (result.paymentDetails) {
            try {
              const res = await fetch(`${API_URL}/booking/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  order_id: order.order_id,
                  date: selectedDate, slot: selectedSlot,
                  name, email, role, level,
                  uid: user?.uid || null,
                }),
              });
              const data = await res.json();
              if (data.success) setPhase('done');
              else { setErrMsg(data.error || 'Confirmation failed.'); setPhase('form'); }
            } catch {
              setErrMsg('Network error during confirmation.'); setPhase('form');
            }
          }
        } catch (err) {
          setErrMsg(err.message || 'Payment failed.'); setPhase('form');
        }
      })
      .catch(() => { setErrMsg('Failed to create order. Please try again.'); setPhase('form'); });
  };

  const inputStyle = {
    width: '100%', background: dark ? '#141414' : '#f9f9f7',
    border: `1px solid ${dark ? '#2a2a2a' : '#ddd'}`,
    borderRadius: 8, padding: '10px 12px', fontSize: 14, color: text,
    fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box',
  };

  if (phase === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: text, margin: '0 0 10px' }}>
            You're booked!
          </h2>
          <p style={{ color: textSub, fontSize: 15, lineHeight: 1.7, margin: '0 0 8px' }}>
            Your session is confirmed for <b style={{ color: text }}>{selectedDate}</b> at <b style={{ color: text }}>{SLOT_LABELS[selectedSlot]?.label} IST</b>.
          </p>
          <p style={{ color: textSub, fontSize: 14, lineHeight: 1.7 }}>
            We'll send the Google Meet link to <b style={{ color: '#F5A623' }}>{email}</b> within a few hours. Keep an eye on your inbox (and spam just in case).
          </p>
          <div style={{ marginTop: 32, padding: '16px 20px', background: dark ? '#111' : '#f5f5f0', borderRadius: 10, border: `1px solid ${border}`, fontSize: 13, color: textSub, lineHeight: 1.8 }}>
            <b style={{ color: text }}>What to expect:</b><br />
            ✅ 45–60 min live interview on Google Meet<br />
            ✅ Real-time feedback & tips at the end<br />
            ✅ Questions tailored to your role & level
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '48px 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 99, fontSize: 12, fontWeight: 600, color: '#F5A623', letterSpacing: '0.08em', marginBottom: 16 }}>
            HUMAN MOCK INTERVIEW
          </span>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px,5vw,40px)', fontWeight: 800, color: text, margin: '0 0 12px', lineHeight: 1.2 }}>
            Interview with a real person
          </h1>
          <p style={{ color: textSub, fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Book a 1-on-1 mock interview over Google Meet. Get honest, real-time feedback — ₹149 per session.
          </p>
        </div>

        {/* Step 1 — Pick a date */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: textSub, marginBottom: 12, textTransform: 'uppercase' }}>1 · Pick a date</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {days.map(d => (
              <button
                key={d.iso}
                onClick={() => { setSelectedDate(d.iso); setPhase('select'); }}
                style={{
                  padding: '10px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: selectedDate === d.iso ? '1.5px solid #F5A623' : `1px solid ${border}`,
                  background: selectedDate === d.iso ? 'rgba(245,166,35,0.08)' : card,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 11, color: selectedDate === d.iso ? '#F5A623' : textSub, fontWeight: 600 }}>{d.day}</div>
                <div style={{ fontSize: 14, color: selectedDate === d.iso ? '#F5A623' : text, fontWeight: 700, marginTop: 2 }}>{d.date}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Pick a slot */}
        {selectedDate && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: textSub, marginBottom: 12, textTransform: 'uppercase' }}>2 · Pick a slot</p>
            {slotsLoading ? (
              <p style={{ color: textSub, fontSize: 14 }}>Checking availability…</p>
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {slots.map(({ slot, available }) => (
                  <button
                    key={slot}
                    disabled={!available}
                    onClick={() => available && setSelectedSlot(slot)}
                    style={{
                      padding: '14px 22px', borderRadius: 10, cursor: available ? 'pointer' : 'not-allowed',
                      border: selectedSlot === slot ? '1.5px solid #F5A623' : `1px solid ${border}`,
                      background: !available ? (dark ? '#111' : '#f0f0f0') : selectedSlot === slot ? 'rgba(245,166,35,0.08)' : card,
                      opacity: !available ? 0.45 : 1,
                      transition: 'all 0.15s', textAlign: 'left', minWidth: 180,
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: selectedSlot === slot ? '#F5A623' : text }}>
                      {SLOT_LABELS[slot]?.label}
                    </div>
                    <div style={{ fontSize: 12, color: textSub, marginTop: 3 }}>
                      {!available ? 'Fully booked' : SLOT_LABELS[slot]?.sub + ' · IST'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Your details */}
        {selectedSlot && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: textSub, marginBottom: 12, textTransform: 'uppercase' }}>3 · Your details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                placeholder="Your name *"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Email address *"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Target role (e.g. SDE, PM) *"
                value={role}
                onChange={e => setRole(e.target.value)}
                style={inputStyle}
              />
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                style={{ ...inputStyle, color: level ? text : textSub }}
              >
                <option value="" disabled>Experience level *</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* CTA */}
        {selectedSlot && (
          <div>
            {errMsg && (
              <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{errMsg}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={handlePay}
                disabled={!canProceed || phase === 'paying'}
                style={{
                  padding: '13px 32px', background: '#F5A623', border: 'none',
                  borderRadius: 10, fontSize: 15, fontWeight: 700, color: '#000',
                  cursor: canProceed && phase !== 'paying' ? 'pointer' : 'not-allowed',
                  opacity: !canProceed || phase === 'paying' ? 0.5 : 1,
                  fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.15s',
                }}
              >
                {phase === 'paying' ? 'Opening payment…' : 'Pay ₹149 & Confirm'}
              </button>
              <p style={{ fontSize: 12, color: textSub, margin: 0 }}>
                Secure payment via Razorpay · Google Meet link sent to your email
              </p>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div style={{ marginTop: 48, padding: '20px 24px', background: card, border: `1px solid ${border}`, borderRadius: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: text, margin: '0 0 12px' }}>What happens after you book</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['1', 'Pay ₹149 — slot is instantly reserved for you'],
              ['2', 'Google Meet link emailed to you within a few hours'],
              ['3', '45–60 min live session with real feedback at the end'],
            ].map(([n, t]) => (
              <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', fontSize: 11, fontWeight: 700, color: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{n}</span>
                <span style={{ fontSize: 13, color: textSub, lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
