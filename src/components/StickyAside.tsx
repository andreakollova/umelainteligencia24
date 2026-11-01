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

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!ref.current) return;
        const { sidebar, parent, parentTop } = heights.current;
        if (!sidebar || !parent) return;

        const vh = window.innerHeight;
        const scrollY = window.scrollY;

        if (sidebar <= vh - 80) {
          setMode('static');
          return;
        }

        const stickyStart = parentTop + sidebar - vh + 20;
        const stickyEnd = parentTop + parent - sidebar - 20;

        if (scrollY < stickyStart) {
          setMode('static');
        } else if (scrollY <= stickyEnd) {
          setMode('fixed');
          setFixedTop(vh - sidebar - 20);
        } else {
          setMode('static');
        }
      });
    }

    function onResize() { measure(); onScroll(); }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    const t1 = setTimeout(() => { measure(); onScroll(); }, 500);
    const t2 = setTimeout(() => { measure(); onScroll(); }, 2000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
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
