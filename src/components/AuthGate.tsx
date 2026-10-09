'use client';

import { useState, useEffect } from 'react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('r24-auth');
    if (saved === 'true') setAuthed(true);
    setLoading(false);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin') {
      sessionStorage.setItem('r24-auth', 'true');
      setAuthed(true);
    } else {
      alert('Nesprávne prihlasovacie údaje');
    }
  }

  if (loading) return null;

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 360, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.png" alt="robotika24" style={{ height: 48, margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Prihláste sa pre prístup</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Meno"
              autoFocus
              style={{ padding: '12px 16px', fontSize: 15, border: '1px solid var(--border)', borderRadius: 8, outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Heslo"
              style={{ padding: '12px 16px', fontSize: 15, border: '1px solid var(--border)', borderRadius: 8, outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
            <button type="submit" style={{ padding: '12px', fontSize: 15, fontWeight: 700, color: '#fff', backgroundColor: '#37b3f2', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              Prihlásiť sa
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
