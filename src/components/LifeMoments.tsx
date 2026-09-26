"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { moments } from "@/lib/content";
import ImageSlot from "./ImageSlot";
import { RevealText } from "./motion";
import { roofie } from "./Mascot";

export default function LifeMoments() {
  const track = useRef<HTMLUListElement>(null);
  const { scrollXProgress } = useScroll({ container: track });
  const progress = useSpring(scrollXProgress, { stiffness: 140, damping: 30 });
  const [edges, setEdges] = useState({ start: true, end: false });

  // Mouse users can drag the rail; touch users get native swipe.
  useEffect(() => {
    const el = track.current!;
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let restore = 0;

    // Scroll positions where each card lines up with the left edge.
    const stops = () => {
      // Same alignment the browser's snap uses: card edge minus its scroll margin, against the scroller's edge.
      const base = el.getBoundingClientRect().left;
      return Array.from(el.children).map((c) => {
        const card = c as HTMLElement;
        return el.scrollLeft + card.getBoundingClientRect().left - base - parseFloat(getComputedStyle(card).scrollMarginLeft);
      });
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startLeft = el.scrollLeft;
      velocity = 0;
      clearTimeout(restore);
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velocity = 0.8 * ((e.clientX - lastX) / dt) + 0.2 * velocity;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.cursor = "";
      // Carry the throw a little, then glide to the nearest card and hand back to native snapping.
      const projected = el.scrollLeft - velocity * 220;
      const max = el.scrollWidth - el.clientWidth;
      const target = stops().reduce((best, x) => (Math.abs(x - projected) < Math.abs(best - projected) ? x : best), 0);
      el.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: "smooth" });
      restore = window.setTimeout(() => {
        el.style.scrollSnapType = "";
        el.style.scrollBehavior = "";
      }, 650);
    };
    const onClick = (e: MouseEvent) => moved && e.preventDefault();
    let lastLeft = el.scrollLeft;
    const onScroll = () => {
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
      // the uncle's eyes follow the cards
      const d = el.scrollLeft - lastLeft;
      lastLeft = el.scrollLeft;
      if (Math.abs(d) > 2) roofie("look", d > 0 ? "right" : "left");
    };
    const noNativeDrag = (e: Event) => e.preventDefault();
    el.addEventListener("dragstart", noNativeDrag);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("dragstart", noNativeDrag);
      el.removeEventListener("pointerdown", onDown);
      clearTimeout(restore);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = track.current!;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 20), behavior: "smooth" });
  };

  return (
    <section aria-labelledby="moments-title" className="overflow-hidden bg-white py-28 sm:py-36 lg:py-44">
      <div className="wrap flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-base font-semibold text-teal">Life moves. Your cover should too.</p>
          <RevealText
            id="moments-title"
            className="font-display mt-5 text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em]"
          >
            Whatever just changed, we have a cover for it.
          </RevealText>
        </div>
        <div className="flex gap-3">
          {(
            [
              [-1, ArrowLeft, "Previous moment", edges.start],
              [1, ArrowRight, "Next moment", edges.end],
            ] as const
          ).map(([dir, Icon, label, disabled]) => (
            <button
              key={label}
              type="button"
              onClick={() => step(dir)}
              disabled={disabled}
              aria-label={label}
              className="grid size-14 place-items-center rounded-full bg-night text-white transition-all duration-300 hover:bg-red disabled:bg-mist disabled:text-ink/30"
            >
              <Icon className="size-5" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={track}
        data-cursor="Drag"
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-[max(clamp(1rem,4vw,3rem),calc((100vw-88rem)/2+3rem))] pb-4 select-none md:cursor-grab [&_img]:pointer-events-none"
        aria-label="Life moments"
      >
        {moments.map((m, i) => (
          <li
            key={m.title}
            className="group w-[80vw] max-w-[24rem] shrink-0 snap-start scroll-ml-[clamp(1rem,4vw,3rem)] sm:w-[22rem]"
          >
            <div className="relative overflow-hidden rounded-[2rem]">
              <div className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
                <ImageSlot slot={m.image} sizes="(min-width: 640px) 24rem, 80vw"  />
              </div>
            </div>
            <h3 className="font-display mt-6 text-2xl leading-tight font-bold tracking-tight">{m.title}</h3>
            <p className="mt-3 text-slate">{m.body}</p>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Suggested cover">
              {m.covers.map((c) => (
                <li key={c} className="rounded-full bg-porcelain px-3 py-1 text-sm font-medium text-slate">
                  {c}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="wrap mt-10">
        <div className="h-[3px] overflow-hidden rounded-full bg-mist">
          <motion.div style={{ scaleX: progress }} className="h-full origin-left rounded-full bg-ink/60" />
        </div>
      </div>
    </section>
  );
}
