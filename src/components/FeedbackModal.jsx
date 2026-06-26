import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const TYPES = ['Bug report', 'Feature request', 'General feedback'];

export default function FeedbackModal({ dark, user, onClose }) {
  const [type, setType]       = useState('General feedback');
  const [message, setMessage] = useState('');
  const [email, setEmail]     = useState(user?.email || '');
  const [status, setStatus]   = useState('idle'); // idle | loading | done | error

  const bg       = dark ? '#0d0d0d' : '#ffffff';
  const border   = dark ? '#1e1e1e' : '#e8e8e0';
  const text      = dark ? '#f0f0f0' : '#1a1a1a';
  const textSub  = dark ? '#888' : '#666';
  const inputBg  = dark ? '#141414' : '#f9f9f7';
  const inputBorder = dark ? '#2a2a2a' : '#ddd';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('loading');
    try {
      await addDoc(collection(db, 'feedback'), {
        type,
        message: message.trim(),
        email: email.trim() || null,
        uid: user?.uid || null,
        name: user?.name || null,
        createdAt: serverTimestamp(),
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const inputStyle = {
    width: '100%',
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    color: text,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'none',
  };

  return (
    /* backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
        padding: 24,
      }}
    >
      {/* card — stop propagation so clicks inside don't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: 24,
          width: 360,
          maxWidth: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {status === 'done' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🙌</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: text, margin: 0 }}>Thanks for your feedback!</p>
            <p style={{ color: textSub, fontSize: 13, marginTop: 6 }}>We read every message.</p>
            <button
              onClick={onClose}
              style={{ marginTop: 20, padding: '9px 24px', background: '#F5A623', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#000', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: text }}>Share feedback</p>
                <p style={{ margin: 0, fontSize: 12, color: textSub, marginTop: 2 }}>Bugs, ideas, or anything on your mind.</p>
              </div>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: textSub, lineHeight: 1 }}>✕</button>
            </div>

            {/* type pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setType(t)}
                  style={{
                    padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    border: type === t ? '1px solid #F5A623' : `1px solid ${inputBorder}`,
                    background: type === t ? 'rgba(245,166,35,0.1)' : inputBg,
                    color: type === t ? '#F5A623' : textSub,
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* message */}
            <textarea
              rows={4}
              required
              placeholder="What's on your mind?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={inputStyle}
            />

            {/* email (pre-filled if logged in, editable) */}
            <input
              type="email"
              placeholder="Your email (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ ...inputStyle, marginTop: 10 }}
            />

            {status === 'error' && (
              <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8, marginBottom: 0 }}>Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !message.trim()}
              style={{
                marginTop: 14, width: '100%', padding: '11px 0',
                background: '#F5A623', border: 'none', borderRadius: 9,
                fontSize: 14, fontWeight: 700, color: '#000',
                cursor: status === 'loading' || !message.trim() ? 'not-allowed' : 'pointer',
                opacity: !message.trim() ? 0.5 : 1,
                fontFamily: "'DM Sans', sans-serif",
                transition: 'opacity 0.15s',
              }}
            >
              {status === 'loading' ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
