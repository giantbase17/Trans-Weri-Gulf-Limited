import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings } from "@/lib/db";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 500;
const FADE_MS = 500;

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const { data: settings } = useQuery({
    queryKey: ["site-settings", "public"],
    queryFn: fetchSiteSettings,
  });

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
          src={settings?.logo_url ?? site.logo}
          alt={`${settings?.company_name ?? site.name} logo`}
          className="h-20 w-auto max-w-[280px] rounded-sm bg-background p-2 object-contain"
        />
      </div>
    </div>
  );
}
