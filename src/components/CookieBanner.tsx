'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
      // Default: deny all until user consents
      window.gtag?.('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500,
      });
    } else if (consent === 'accepted') {
      grantConsent();
    }
  }, []);

  function grantConsent() {
    window.gtag?.('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
  }

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    grantConsent();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined');
    window.gtag?.('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 70,
      backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      padding: '20px 0',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, minWidth: 280 }}>
          Táto stránka používa cookies na zabezpečenie funkčnosti webu, analýzu návštevnosti a zobrazovanie personalizovaných reklám.
          Kliknutím na „Súhlasím" udeľujete súhlas so spracovaním cookies v súlade s nariadením GDPR.{' '}
          <Link href="/cookies" style={{ color: '#37b3f2', textDecoration: 'underline' }}>Zásady cookies</Link>
          {' '}|{' '}
          <Link href="/ochrana-sukromia" style={{ color: '#37b3f2', textDecoration: 'underline' }}>Ochrana súkromia</Link>
        </p>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              padding: '10px 24px', fontSize: 13, fontWeight: 700,
              color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 24, border: 'none', cursor: 'pointer',
            }}
          >
            Len nevyhnutné
          </button>
          <button
            onClick={accept}
            style={{
              padding: '10px 24px', fontSize: 13, fontWeight: 700,
              color: '#fff', backgroundColor: '#37b3f2',
              borderRadius: 24, border: 'none', cursor: 'pointer',
            }}
          >
            Súhlasím
          </button>
        </div>
      </div>
    </div>
  );
}
