"use client";

import { useEffect, useRef } from "react";

/** A wordmark whose letters swell as the pointer passes over them. */
export default function FluidWord({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const el = ref.current!;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-l]"));
    const zone = el.parentElement!;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        letters.forEach((l) => {
          const r = l.getBoundingClientRect();
          const d = Math.abs(e.clientX - (r.left + r.width / 2)) / (r.width * 1.3);
          const inf = Math.exp(-d * d);
          l.style.fontVariationSettings = `"wdth" ${(80 + 45 * inf).toFixed(1)}, "wght" ${(300 + 600 * inf).toFixed(0)}`;
        });
      });
    };
    const reset = () =>
      letters.forEach((l) => (l.style.fontVariationSettings = `"wdth" 125, "wght" 900`));
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(raf);
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={className} style={style}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          data-l
          className="inline-block transition-[font-variation-settings] duration-500 ease-[var(--ease-out-expo)]"
          style={{ fontVariationSettings: `"wdth" 125, "wght" 900` }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </div>
  );
}
