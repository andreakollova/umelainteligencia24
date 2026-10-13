'use client';

import { useEffect, useRef } from 'react';

export default function AdBlock({ format = 'rectangle' }: { format?: 'rectangle' | 'vertical' | 'horizontal' }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, []);

  // Display ad for sidebar (rectangle/vertical)
  return (
    <div style={{ textAlign: 'center' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1548129646460327"
        data-ad-slot="7681406163"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <p style={{ fontSize: 10, color: '#d1d5db', marginTop: 4, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
        Inzercia
      </p>
    </div>
  );
}
