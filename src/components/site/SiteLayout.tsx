import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { QuoteCta } from "./QuoteCta";
import { WhatsAppFab } from "./WhatsAppFab";
import { site } from "@/lib/site";

export function SiteLayout({
  children,
  hideCta = false,
}: {
  children: ReactNode;
  hideCta?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Faint full-page watermark so the brand mark shows through every
       * plain/light section site-wide, not just the navbar and footer.
       * Fixed + very low opacity so it never competes with real content or
       * shows up over opaque photo sections (hero, equipment cards, etc). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <img
          src={site.logo}
          alt=""
          className="w-[90vw] max-w-3xl opacity-[0.035] sm:w-[55vw]"
        />
      </div>
      {/* Unsharp-mask filter shared by every equipment photo (see the
       * `equipment-photo` utility in styles.css) — defined once, referenced
       * by id via `filter: url(#equip-sharpen)`. Zero-size and aria-hidden
       * so it never affects layout or is announced to screen readers. */}
      <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <filter id="equip-sharpen">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blurred" />
          <feComposite
            in="SourceGraphic"
            in2="blurred"
            operator="arithmetic"
            k1="0"
            k2="1.6"
            k3="-0.6"
            k4="0"
          />
        </filter>
      </svg>
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <div className="relative z-10">
        {!hideCta && <QuoteCta />}
        <Footer />
      </div>
      <WhatsAppFab />
    </div>
  );
}
