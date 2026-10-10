'use client';

import { useEffect } from 'react';

export default function CopyProtection() {
  useEffect(() => {
    // Disable right-click on images
    function handleContextMenu(e: MouseEvent) {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    }

    // Disable drag on images
    function handleDragStart(e: DragEvent) {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    }

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    function handleCopy(e: ClipboardEvent) {
      const selection = window.getSelection()?.toString() || '';
      if (selection.length > 50) {
        // Append source attribution to copied text
        const url = window.location.href;
        const attribution = `\n\nZdroj: inteligencia24.sk\n${url}\n© inteligencia24.sk - Všetky práva vyhradené.`;
        e.clipboardData?.setData('text/plain', selection + attribution);
        e.preventDefault();

        // Notify about copy (fire and forget)
        fetch('/api/track-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            textLength: selection.length,
            firstWords: selection.substring(0, 100),
          }),
        }).catch(() => {});
      }
    }

    document.addEventListener('copy', handleCopy);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
