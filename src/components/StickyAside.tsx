'use client';

import { useRef, useEffect, useState } from 'react';

export default function StickyAside({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number | undefined>(undefined);

  useEffect(() => {
    function calc() {
      if (!ref.current) return;
      const sidebarH = ref.current.offsetHeight;
      const viewportH = window.innerHeight;
      // Sidebar is taller than viewport: stick when its bottom hits viewport bottom
      // top = -(sidebarHeight - viewportHeight + padding)
      if (sidebarH > viewportH - 80) {
        setTop(-(sidebarH - viewportH + 20));
      } else {
        setTop(80);
      }
    }

    // ResizeObserver for when images load and change height
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);

    window.addEventListener('resize', calc);
    calc();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calc);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="sidebar-sticky"
      style={top !== undefined ? { position: 'sticky', top, zIndex: 10 } : undefined}
    >
      {children}
    </div>
  );
}
