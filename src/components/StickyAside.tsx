'use client';

import { useRef, useEffect, useState } from 'react';

export default function StickyAside({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(80);

  useEffect(() => {
    function calc() {
      if (!ref.current) return;
      const h = ref.current.offsetHeight;
      const vh = window.innerHeight;
      // If sidebar is taller than viewport, stick when bottom reaches viewport bottom
      if (h > vh - 100) {
        setStickyTop(vh - h - 20);
      } else {
        setStickyTop(80);
      }
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return (
    <aside
      ref={ref}
      className="sidebar-sticky"
      style={{ position: 'sticky', top: stickyTop }}
    >
      {children}
    </aside>
  );
}
