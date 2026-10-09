'use client';

import { useState, useEffect } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQ, setCaptchaQ] = useState({ a: 0, b: 0 });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setCaptchaQ({ a: Math.floor(Math.random() * 9) + 1, b: Math.floor(Math.random() * 9) + 1 });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (parseInt(captchaAnswer) !== captchaQ.a + captchaQ.b) {
      setStatus('error');
      setFeedback('Nesprávna odpoveď na overenie.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, captcha: 'ok' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setFeedback(data.message);
        setName(''); setEmail(''); setMessage(''); setCaptchaAnswer('');
      } else {
        setStatus('error');
        setFeedback(data.error);
      }
    } catch {
      setStatus('error');
      setFeedback('Nastala chyba. Skúste to znova.');
    }
  }

  return (
    <div style={{ marginTop: 40, paddingTop: 32, borderTop: '2px solid #37b3f2' }}>
      <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Napíšte nám</h3>
      {status === 'success' ? (
        <p style={{ color: '#16a34a', fontSize: 14 }}>{feedback}</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="max-sm:!grid-cols-1">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Meno" required
            style={{ padding: '10px 14px', fontSize: 14, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, color: 'var(--text-primary)', outline: 'none' }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" required
            style={{ padding: '10px 14px', fontSize: 14, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, color: 'var(--text-primary)', outline: 'none' }} />
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Správa" required rows={3}
            style={{ padding: '10px 14px', fontSize: 14, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, color: 'var(--text-primary)', outline: 'none', gridColumn: '1 / -1', resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1 / -1' }}>
            <span style={{ color: '#9ca3af', fontSize: 13 }}>{captchaQ.a} + {captchaQ.b} =</span>
            <input type="text" value={captchaAnswer} onChange={e => setCaptchaAnswer(e.target.value)} required
              style={{ width: 60, padding: '8px 12px', fontSize: 14, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, color: 'var(--text-primary)', outline: 'none' }} />
            <button type="submit" disabled={status === 'loading'}
              style={{ marginLeft: 'auto', padding: '10px 24px', fontSize: 13, fontWeight: 700, color: '#fff', backgroundColor: '#37b3f2', borderRadius: 24, border: 'none', cursor: 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}>
              {status === 'loading' ? 'Odosiela sa...' : 'Odoslať'}
            </button>
          </div>
          {status === 'error' && <p style={{ color: '#ef4444', fontSize: 13, gridColumn: '1 / -1' }}>{feedback}</p>}
        </form>
      )}
    </div>
  );
}
