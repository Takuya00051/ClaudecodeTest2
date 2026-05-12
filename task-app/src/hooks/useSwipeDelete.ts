import { useRef, useCallback } from 'react';

interface Options {
  onDelete: () => void;
  threshold?: number;
}

export function useSwipeDelete({ onDelete, threshold = 80 }: Options) {
  const startX = useRef(0);
  const startY = useRef(0);
  const deltaX = useRef(0);
  const isHorizontal = useRef(false);
  const el = useRef<HTMLDivElement>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    deltaX.current = 0;
    isHorizontal.current = false;
    if (el.current) {
      el.current.style.transition = '';
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!isHorizontal.current && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    if (!isHorizontal.current) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontal.current) return;
    if (dx > 0) return;

    e.preventDefault();
    deltaX.current = dx;
    if (el.current) {
      const clamped = Math.max(dx, -120);
      el.current.style.transform = `translateX(${clamped}px)`;
      el.current.style.opacity = String(Math.max(0.3, 1 + dx / 200));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isHorizontal.current) return;
    if (deltaX.current < -threshold) {
      onDelete();
    } else {
      if (el.current) {
        el.current.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        el.current.style.transform = 'translateX(0)';
        el.current.style.opacity = '1';
        setTimeout(() => {
          if (el.current) el.current.style.transition = '';
        }, 200);
      }
    }
  }, [onDelete, threshold]);

  return { ref: el, onTouchStart, onTouchMove, onTouchEnd };
}
