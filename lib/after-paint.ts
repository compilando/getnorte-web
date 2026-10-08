import { useEffect, useState } from "react";

/**
 * `value`, a frame late: it changes only after the browser has painted the
 * render that changed it. A tab or a chip repaints at once, and the screen it
 * asks for (thousands of spans) is laid out in a task of its own, so the click
 * is answered in one frame. useDeferredValue is not enough: React runs the
 * deferred render in a task that can still come before that paint.
 */
export function useAfterPaint<T>(value: T): T {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    let timer = 0;
    // rAF runs just before the next paint; a timeout set there runs after it.
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setShown(value), 0);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [value]);
  return shown;
}
