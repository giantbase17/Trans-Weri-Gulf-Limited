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
// stream doesn't restart the timer on every single event.
const THROTTLE_MS = 5_000;

/**
 * Calls `onIdle` once the user has gone `timeoutMs` without mouse, keyboard,
 * touch or scroll activity. The clock starts fresh on every mount — a login
 * (which is what mounts this) is itself proof of activity, so it must never
 * be compared against activity recorded before a prior sign-out. Concretely:
 * don't persist the last-activity timestamp across mounts/sign-outs, or a
 * sign-out that happens to be stale by the time of the next login will
 * immediately sign the user straight back out.
 */
export function useIdleLogout(
  onIdle: () => void,
  timeoutMs: number,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setTimeout>;
    let lastHandled = 0;

    function reset() {
      clearTimeout(timer);
      timer = setTimeout(() => onIdleRef.current(), timeoutMs);
    }

    function handleActivity() {
      const now = Date.now();
      if (now - lastHandled < THROTTLE_MS) return;
      lastHandled = now;
      reset();
    }

    reset();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [enabled, timeoutMs]);
}
