import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

// Collapses activity handling to once per window so a mousemove/scroll
// stream doesn't hit localStorage on every event.
const THROTTLE_MS = 5_000;

/**
 * Calls `onIdle` once the user has gone `timeoutMs` without mouse, keyboard,
 * touch or scroll activity. The last-activity timestamp is persisted to
 * localStorage (shared across tabs on the same origin) so closing the tab
 * and reopening it later — or another tab of the same dashboard — counts
 * toward the same idle clock rather than resetting on every mount.
 */
export function useIdleLogout(
  onIdle: () => void,
  timeoutMs: number,
  options: { enabled?: boolean; storageKey?: string } = {},
) {
  const { enabled = true, storageKey = "twg-admin-last-active" } = options;
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;

    function readLastActive(): number {
      const parsed = Number(localStorage.getItem(storageKey));
      return Number.isFinite(parsed) && parsed > 0 ? parsed : Date.now();
    }

    let timer: ReturnType<typeof setTimeout>;
    let lastHandled = 0;

    function scheduleFromLastActive() {
      clearTimeout(timer);
      const remaining = timeoutMs - (Date.now() - readLastActive());
      if (remaining <= 0) {
        onIdleRef.current();
        return;
      }
      timer = setTimeout(scheduleFromLastActive, remaining);
    }

    function handleActivity() {
      const now = Date.now();
      if (now - lastHandled < THROTTLE_MS) return;
      lastHandled = now;
      localStorage.setItem(storageKey, String(now));
      scheduleFromLastActive();
    }

    if (Date.now() - readLastActive() >= timeoutMs) {
      onIdleRef.current();
      return;
    }

    localStorage.setItem(storageKey, String(Date.now()));
    scheduleFromLastActive();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [enabled, timeoutMs, storageKey]);
}
