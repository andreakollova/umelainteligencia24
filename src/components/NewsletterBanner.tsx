'use client';

import { useState } from 'react';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section style={{ backgroundColor: '#051722', padding: '40px 20px', marginBottom: 32, marginTop: 32 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        {/* Left - text */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', marginBottom: 6, margin: 0 }}>
            Nepremeškajte žiadnu novinku zo sveta umelej inteligencie
          </h2>
          <p style={{ fontSize: 14, color: '#ffffff', opacity: 0.7, lineHeight: 1.5, margin: '8px 0 0' }}>
            Pridajte sa k odberateľom a dostávajte najzaujímavejšie správy o AI systémoch, AI a technológiách priamo do schránky.
          </p>
        </div>

        {/* Right - form */}
        <div style={{ flexShrink: 0 }}>
          {status === 'success' ? (
            <p style={{ color: '#16a34a', fontSize: 15, fontWeight: 600 }}>Ďakujeme! Ste prihlásený na odber.</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.sk"
                className="newsletter-input"
                required
                style={{
                  width: 240, padding: '12px 18px', fontSize: 14,
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 24, outline: 'none',
                  backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  padding: '12px 24px', fontSize: 14, fontWeight: 700,
                  color: '#fff', backgroundColor: '#37b3f2', borderRadius: 24,
                  border: 'none', cursor: 'pointer',
                  opacity: status === 'loading' ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {status === 'loading' ? 'Odosiela sa...' : 'Odoberať'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>Nastala chyba. Skúste to znova.</p>
          )}
        </div>
      </div>
    </section>
  );
}
