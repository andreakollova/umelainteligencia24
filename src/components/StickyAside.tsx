'use client';

import { useRef, useEffect, useState } from 'react';

export default function StickyAside({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(80);

  useEffect(() => {
    function calc() {
      if (!ref.current) return;
      const h = ref.current.scrollHeight;
      const vh = window.innerHeight;
      if (h > vh - 100) {
        setStickyTop(-(h - vh + 40));
      } else {
        setStickyTop(80);
      }
    }

    // Recalculate on resize
    window.addEventListener('resize', calc);

    // Recalculate when sidebar content changes size (images load etc.)
    const observer = new ResizeObserver(calc);
    if (ref.current) observer.observe(ref.current);

    // Also recalculate after images load
    const timer1 = setTimeout(calc, 500);
    const timer2 = setTimeout(calc, 1500);
    const timer3 = setTimeout(calc, 3000);

    return () => {
      window.removeEventListener('resize', calc);
      observer.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="sidebar-sticky"
      style={{ position: 'sticky', top: stickyTop }}
    >
      {children}
    </div>
  );
}
