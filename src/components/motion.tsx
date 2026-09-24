"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Headline that rises into view line by line, through a mask. */
export function RevealText({
  as: Tag = "h2",
  className,
  children,
  id,
  delay = 0,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  children: React.ReactNode;
  id?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let split: SplitText | undefined;
        document.fonts.ready.then(() => {
          if (!ref.current) return;
          split = SplitText.create(ref.current, { type: "lines", mask: "lines", linesClass: "pb-[0.06em] -mb-[0.06em]" });
          gsap.from(split.lines, {
            yPercent: 110,
            rotate: 2,
            transformOrigin: "0% 100%",
            duration: 1.2,
            delay,
            stagger: 0.09,
            ease: "expo.out",
            scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
          });
        });
        return () => split?.revert();
      });
    },
    { scope: ref },
  );

  return (
    // @ts-expect-error polymorphic ref
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}

/** Thin progress line pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-teal/70"
    />
  );
}

/** Soft ring that trails the pointer and grows over interactive elements. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!fine.matches) return;
    setEnabled(true);
    const el = dot.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
    gsap.set(el, { opacity: 0 });
    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        gsap.to(el, { opacity: 1, duration: 0.3 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor ?? null);
      setActive(!!t.closest("a, button, [role=radio], [data-cursor]"));
    };
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.3 });
    const enter = () => gsap.to(el, { opacity: 1, duration: 0.3 });
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      className={clsx("pointer-events-none fixed top-0 left-0 z-[70]", !enabled && "hidden")}
    >
      <div
        className={clsx(
          "grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-[width,height,background-color,border-color] duration-300 ease-[var(--ease-out-expo)]",
          label
            ? "size-20 bg-night text-white shadow-lg"
            : active
              ? "size-14 border border-teal/60 bg-teal/10"
              : "size-7 border border-ink/35",
        )}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-sm font-semibold"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Branded opening beat: three "Cha"s, then the curtain lifts. */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setDone(true);
        return;
      }
      document.documentElement.style.overflow = "hidden";
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = "";
          setDone(true);
        },
      });
      // The logo wipes in from the left, a thin line fills beneath it, then the curtain lifts.
      tl.fromTo(".intro-logo", { clipPath: "inset(0 100% 0 0)", y: 8 }, { clipPath: "inset(0 0% 0 0)", y: 0, duration: 0.8, ease: "power3.out" })
        .fromTo(".intro-bar", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, "<0.15")
        .to(".intro-inner", { y: -16, opacity: 0, duration: 0.4, ease: "power2.in" }, "+=0.15")
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut" }, "-=0.2");
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[80] grid place-items-center bg-white motion-reduce:hidden"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div className="intro-inner flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/chacha-logo-full.png"
          alt=""
          width={788}
          height={316}
          className="intro-logo h-auto w-[min(70vw,20rem)]"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        />
        <span className="mt-6 h-[2px] w-24 overflow-hidden rounded-full bg-ink/8">
          <span className="intro-bar block h-full origin-left scale-x-0 bg-red" />
        </span>
      </div>
    </div>
  );
}

export const INTRO_DELAY = 1.45;
