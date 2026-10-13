'use client';

import { useRef, useEffect, useState } from 'react';

export default function StickyAside({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function update() {
      if (!ref.current) return;
      const sidebar = ref.current;
      const parent = sidebar.parentElement?.parentElement; // content-layout
      if (!parent) return;

      const sidebarH = sidebar.offsetHeight;
      const viewportH = window.innerHeight;
      const parentRect = parent.getBoundingClientRect();
      const parentBottom = parentRect.bottom;

      // If sidebar fits in viewport, simple sticky top
      if (sidebarH <= viewportH - 80) {
        setStyle({ position: 'sticky', top: 80, zIndex: 10 });
        return;
      }

      const scrollY = window.scrollY;
      const sidebarTop = parent.offsetTop;
      const stickyPoint = sidebarTop + sidebarH - viewportH + 20;

      if (scrollY < stickyPoint) {
        // Haven't scrolled past sidebar bottom yet — no sticky
        setStyle({ zIndex: 10 });
      } else {
        // Sidebar bottom reached viewport bottom — stick it
        setStyle({ position: 'sticky', top: -(sidebarH - viewportH + 20), zIndex: 10 });
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    // Initial + delayed for images
    update();
    const t1 = setTimeout(update, 500);
    const t2 = setTimeout(update, 1500);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div ref={ref} className="sidebar-sticky" style={style}>
      {children}
    </div>
  );
}
