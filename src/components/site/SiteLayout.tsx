import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { QuoteCta } from "./QuoteCta";
import { WhatsAppFab } from "./WhatsAppFab";

export function SiteLayout({
  children,
  hideCta = false,
}: {
  children: ReactNode;
  hideCta?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
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
      <main className="flex-1">{children}</main>
      {!hideCta && <QuoteCta />}
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
