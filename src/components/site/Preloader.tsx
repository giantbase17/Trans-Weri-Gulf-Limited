import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 500;
const FADE_MS = 500;

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let minTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const finish = () => {
      minTimer = setTimeout(() => {
        setFading(true);
        hideTimer = setTimeout(() => setVisible(false), FADE_MS);
      }, MIN_VISIBLE_MS);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(minTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-brand-deep transition-opacity duration-500",
        fading ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <div className="relative grid place-items-center">
        <span className="absolute -inset-3.5 animate-spin rounded-full border-[3px] border-white/15 border-t-signal motion-reduce:animate-none" />
        <img
          src={site.logo}
          alt={`${site.name} logo`}
          className="h-14 w-auto rounded-sm bg-background p-1.5"
        />
      </div>
    </div>
  );
}
