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
    <section style={{ backgroundColor: '#051722', padding: '48px 20px', marginBottom: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <img src="/newsletter-owl.png" alt="umelá inteligencia24" style={{ height: 120, margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
          Nepremeškajte žiadnu novinku zo sveta umelej inteligencie
        </h2>
        <p style={{ fontSize: 15, color: '#ffffff', marginBottom: 24, opacity: 0.8, lineHeight: 1.5 }}>
          Pridajte sa k odberateľom a dostávajte najzaujímavejšie správy o AI systémoch, AI a technológiách priamo do schránky.
        </p>

        {status === 'success' ? (
          <p style={{ color: '#16a34a', fontSize: 16, fontWeight: 600 }}>Ďakujeme! Ste prihlásený na odber.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 480, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.sk"
              className="newsletter-input"
              required
              style={{
                flex: 1, minWidth: 220, padding: '14px 20px', fontSize: 15,
                border: '1px solid #ffffff', borderRadius: 24, outline: 'none',
                backgroundColor: '#051722', color: '#ffffff',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '14px 28px', fontSize: 14, fontWeight: 700,
                color: '#fff', backgroundColor: '#37b3f2', borderRadius: 24,
                border: 'none', cursor: 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
            >
              {status === 'loading' ? 'Odosiela sa...' : 'Odoberať'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>Nastala chyba. Skúste to znova.</p>
        )}
      </div>
    </section>
  );
}
