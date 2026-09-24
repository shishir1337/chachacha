"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { moments } from "@/lib/content";
import ImageSlot from "./ImageSlot";
import { RevealText } from "./motion";

export default function LifeMoments() {
  const track = useRef<HTMLUListElement>(null);
  const { scrollXProgress } = useScroll({ container: track });
  const progress = useSpring(scrollXProgress, { stiffness: 140, damping: 30 });
  const [edges, setEdges] = useState({ start: true, end: false });

  // Mouse users can drag the rail; touch users get native swipe.
  useEffect(() => {
    const el = track.current!;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
    };
    const onClick = (e: MouseEvent) => moved && e.preventDefault();
    const onScroll = () =>
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
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
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-[max(clamp(1rem,4vw,3rem),calc((100vw-88rem)/2+3rem))] pb-4 select-none"
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
