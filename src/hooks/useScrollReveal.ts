import { useEffect, useRef } from "react";

/**
 * Registers GSAP ScrollTrigger reveal animations for elements marked with
 * [data-reveal] inside the returned container ref. Client-only.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const scope = useRef<T | null>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !scope.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        targets.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              delay: Number(el.dataset["revealDelay"] ?? 0),
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const strength = Number(el.dataset["parallax"] ?? 80);
          gsap.to(el, {
            y: strength,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-track]").forEach((el) => {
          const dir = el.dataset["track"] === "left" ? -1 : 1;
          gsap.fromTo(
            el,
            { x: 120 * dir, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            },
          );
        });
      }, scope.current!);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return scope;
}
