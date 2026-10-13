'use client';

import { useRef, useEffect, useState } from 'react';

export default function StickyAside({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'static' | 'fixed' | 'stuck'>('static');
  const [fixedTop, setFixedTop] = useState(0);
  const heights = useRef({ sidebar: 0, parent: 0, parentTop: 0 });

  useEffect(() => {
    function measure() {
      if (!ref.current) return;
      const parent = ref.current.parentElement?.parentElement;
      if (!parent) return;
      heights.current = {
        sidebar: ref.current.offsetHeight,
        parent: parent.offsetHeight,
        parentTop: parent.offsetTop,
      };
    }

    function onScroll() {
      if (!ref.current) return;
      const { sidebar, parent, parentTop } = heights.current;
      if (!sidebar || !parent) return;

      const vh = window.innerHeight;
      const scrollY = window.scrollY;

      // If sidebar fits in viewport, always sticky top
      if (sidebar <= vh - 80) {
        setMode('static');
        return;
      }

      // Point where sidebar bottom aligns with viewport bottom
      const stickyStart = parentTop + sidebar - vh + 20;
      // Point where parent ends (sidebar should stop)
      const stickyEnd = parentTop + parent - sidebar - 20;

      if (scrollY < stickyStart) {
        // Scrolling through sidebar content — let it scroll naturally
        setMode('static');
      } else if (scrollY <= stickyEnd) {
        // Sidebar bottom hit viewport bottom — fix it
        setMode('fixed');
        setFixedTop(vh - sidebar - 20);
      } else {
        // Past parent — stick at bottom of parent
        setMode('static');
      }
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); onScroll(); });
    const t1 = setTimeout(() => { measure(); onScroll(); }, 500);
    const t2 = setTimeout(() => { measure(); onScroll(); }, 2000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', () => { measure(); onScroll(); });
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const style: React.CSSProperties = mode === 'fixed'
    ? { position: 'fixed', top: fixedTop, width: 340, zIndex: 10 }
    : { zIndex: 10 };

  return (
    <div ref={ref} className="sidebar-sticky" style={style}>
      {children}
    </div>
  );
}
