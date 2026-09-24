"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { steps } from "@/lib/content";
import { Button } from "./ui";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        gsap.to(".process-bar", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
        gsap.utils.toArray<HTMLElement>(".process-step").forEach((step) => {
          gsap.from(step.querySelector(".process-num"), {
            yPercent: 60,
            opacity: 0,
            ease: "expo.out",
            duration: 1.2,
            scrollTrigger: { trigger: step, containerAnimation: tween, start: "left 85%" },
          });
        });
      });
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".process-step").forEach((step) => {
          gsap.from(step, { y: 50, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: step, start: "top 85%" } });
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="process-title"
      className="grain relative overflow-hidden bg-night text-white lg:h-dvh"
    >
            <div aria-hidden className="animate-drift-slow pointer-events-none absolute -top-60 -left-40 size-[40rem] rounded-full bg-teal/25 blur-[140px]" />

      <div
        ref={track}
        className="relative flex flex-col gap-4 px-[clamp(1rem,4vw,3rem)] py-28 sm:py-36 lg:py-44 lg:h-full lg:w-max lg:flex-row lg:items-stretch lg:gap-6 lg:py-[max(7rem,14vh)]"
      >
        <div className="flex max-w-xl flex-col justify-between gap-10 pb-10 lg:w-[34rem] lg:shrink-0 lg:pr-16 lg:pb-0">
          <div>
            <p className="text-base font-semibold text-seaglass">How ChaCha works</p>
            <h2 id="process-title" className="font-display mt-5 text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em]">
              Four steps. One easy rhythm.
            </h2>
            <p className="mt-6 max-w-md text-lg text-white/70">
              You tell us what matters. We do the legwork across the market, then keep an eye on things after you sign.
            </p>
          </div>
          <div>
            <Button href="/get-a-quote" variant="white">
              Start step one
            </Button>
          </div>
        </div>

        {steps.map((s, i) => (
          <article
            key={s.title}
            className="process-step relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white/[0.06] p-7 ring-1 ring-white/10 backdrop-blur-sm sm:p-9 lg:w-[min(30rem,38vw)] lg:shrink-0"
          >
            <span
              aria-hidden
              className="process-num font-display block text-[clamp(6rem,14vw,12rem)] leading-[0.8] font-black text-transparent"
              style={{ WebkitTextStroke: "2px rgb(159 214 204 / 0.35)", fontVariationSettings: '"wdth" 75' }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="mt-10 lg:mt-0">
              <p className="text-sm font-semibold text-seaglass">Step {i + 1} of 4</p>
              <h3 className="font-display mt-3 text-2xl leading-tight font-bold tracking-tight sm:text-3xl">{s.title}</h3>
              <p className="mt-4 text-white/70">{s.body}</p>
            </div>
          </article>
        ))}
        <div aria-hidden className="hidden lg:block lg:w-[8vw] lg:shrink-0" />
      </div>

      <div aria-hidden className="absolute inset-x-[clamp(1rem,4vw,3rem)] bottom-10 hidden h-px bg-white/15 lg:block">
        <div className="process-bar h-full origin-left scale-x-0 bg-seaglass/80" />
      </div>
    </section>
  );
}
