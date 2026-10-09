'use client';

import { useEffect, useRef } from 'react';

export default function AdBlock({ format = 'rectangle' }: { format?: 'rectangle' | 'vertical' | 'horizontal' }) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, []);

  const style: Record<string, string> = {
    rectangle: 'display:inline-block;width:300px;height:250px',
    vertical: 'display:inline-block;width:300px;height:600px',
    horizontal: 'display:inline-block;width:728px;height:90px',
  };

  return (
    <div style={{ textAlign: 'center' as const }} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: format === 'horizontal' ? 728 : 300, height: format === 'vertical' ? 600 : format === 'horizontal' ? 90 : 250 }}
        data-ad-client="ca-pub-1548129646460327"
        data-ad-slot=""
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <p style={{ fontSize: 10, color: '#d1d5db', marginTop: 4, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
        Inzercia
      </p>
    </div>
  );
}
