"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import ImageSlot from "./ImageSlot";
import { Button, Roof } from "./ui";

gsap.registerPlugin(useGSAP, SplitText);

export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".statement-text", { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: ".statement-text", start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );
        gsap.fromTo(
          ".statement-img",
          { clipPath: "inset(18% 12% 18% 12% round 2rem)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 2rem)",
            ease: "none",
            scrollTrigger: { trigger: ".statement-img", start: "top 90%", end: "center 55%", scrub: true },
          },
        );
        return () => split.revert();
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="statement-title" className="bg-white py-28 sm:py-36 lg:py-44 lg:py-40">
      <div className="wrap grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ImageSlot slot="independent" className="statement-img rounded-[2rem]" priority={false} />
        </div>
        <div className="flex flex-col justify-center">
          <h2 id="statement-title" className="flex items-center gap-3 text-base font-semibold text-teal">
            <Roof className="h-4 w-10 text-red" />
            On your side of the table
          </h2>
          <p className="statement-text font-display mt-8 text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1.25] font-medium tracking-[-0.02em]">
            Most agents work for one insurance company. We work for you. We compare dozens of carriers side by side, translate the
            fine print into plain English, and stay with you long after the policy starts.
          </p>
          <div className="mt-12 grid gap-8 border-t border-ink/10 pt-8 sm:grid-cols-2">
            <p className="text-slate">
              Most people come to us for one policy and end up moving two or three across. Not because we push, but because
              the numbers usually make sense.
            </p>
            <div className="sm:justify-self-end">
              <Button href="/about-us" variant="ghost">
                Meet the agency
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
