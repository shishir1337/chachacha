"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import HeroPicker from "./HeroPicker";
import { INTRO_DELAY } from "./motion";
import ChaStage from "./ChaStage";
import CoverCards from "./CoverCards";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  // The picked cover drives a short scene around the roof below.
  const [cover, setCover] = useState<string | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const pick = (v: string) => {
    setCover(v);
    setSceneKey((k) => k + 1);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // One calm entrance: the hero fades up as a whole, nothing bounces or stretches.
        gsap.from([".hero-lead", ".hero-sub", ".cha-row", ".hero-picker", ".hero-cards", ".hero-scroll"], {
          y: 18,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power2.out",
          delay: INTRO_DELAY,
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      onPointerMove={(e) => {
        const r = root.current!.getBoundingClientRect();
        root.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        root.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className="group/hero relative overflow-hidden pt-28 pb-20 sm:pt-36 lg:pb-28 [@media(max-height:780px)]:sm:pt-28"
    >
      {/* soft brand glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift absolute -top-48 -right-32 size-[42rem] rounded-full bg-seaglass/20 blur-[120px]" />
        <div className="animate-drift-slow absolute top-[30%] -left-64 size-[36rem] rounded-full bg-blush/50 blur-[120px]" />
        <div className="animate-drift absolute -bottom-40 left-[40%] size-[30rem] rounded-full bg-foam/60 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(rgb(10 34 41 / 0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at 30% 20%, black, transparent 70%)",
          }}
        />
        {/* A spotlight of teal dots that follows the pointer. */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/hero:opacity-100"
          style={{
            backgroundImage: "radial-gradient(rgb(27 107 102 / 0.32) 1.2px, transparent 1.6px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), black, transparent 75%)",
          }}
        />
      </div>

      <div className="wrap relative">
        {/* Headline and the picker share the first view with the stage, so a pick and its scene are seen together. */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 xl:items-start">
          <h1>
            <span className="hero-lead font-display block text-[clamp(2.5rem,5.4vw,5.25rem)] leading-[0.98] font-semibold tracking-[-0.045em]">
              Better rates,
              <br className="hidden lg:block" /> easy as
            </span>
            <span className="sr-only"> Cha Cha Cha.</span>
          </h1>
          <div className="lg:max-w-[22rem] lg:pb-2 xl:pt-4">
            <p className="hero-sub text-[0.9375rem] leading-relaxed text-slate sm:text-lg">
              We are not tied to one insurer. We shop dozens of them and explain the differences in plain English.
            </p>
          </div>
        </div>

        {/* The signature line. Decorative, interactive duplicate of the h1 ending. */}
        <div className="relative mt-6 sm:mt-10 [@media(max-height:780px)]:sm:mt-6">
          <ChaStage scene={cover} sceneKey={sceneKey} />
          {/* The hand of policy cards sits beside the words and answers the picker below. */}
          <CoverCards
            cover={cover}
            dealKey={sceneKey}
            className="hero-cards absolute right-4 bottom-[max(3rem,4vw)] hidden xl:block"
          />
        </div>

        <HeroPicker className="hero-picker mt-2" value={cover} onPick={pick} />

        {/* A quiet cue that there is more below. */}
        <a
          href="#statement-title"
          onClick={(e) => {
            e.preventDefault();
            window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
          }}
          className="hero-scroll mx-auto mt-10 hidden w-fit flex-col items-center gap-2 text-xs font-medium text-slate/80 transition-colors hover:text-ink sm:flex [@media(max-height:780px)]:hidden"
        >
          Scroll to explore
          <span aria-hidden className="relative h-10 w-[2px] overflow-hidden rounded-full bg-ink/10">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-teal" />
          </span>
        </a>

      </div>
    </section>
  );
}
