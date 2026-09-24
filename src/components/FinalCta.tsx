"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { contact } from "@/lib/content";
import { images } from "@/lib/images";
import QuoteCard from "./QuoteCard";

gsap.registerPlugin(useGSAP);

const morph = { type: "spring", stiffness: 210, damping: 28, mass: 0.9 } as const;

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const openCard = () => {
    setOpen(true);
    // On small screens the card opens below the text, so bring it into view.
    if (window.innerWidth < 1024) setTimeout(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
  };
  const close = useCallback(() => {
    setOpen(false);
    setTimeout(() => trigger.current?.focus(), 450);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cta-card",
          { scale: 0.9, borderRadius: "4rem" },
          {
            scale: 1,
            borderRadius: "2.5rem",
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 25%", scrub: true },
          },
        );
        gsap.fromTo(
          ".cta-word",
          { fontVariationSettings: '"wdth" 75' },
          {
            fontVariationSettings: '"wdth" 125',
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 20%", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="cta-title" className="px-3 py-6 sm:px-5">
      <div className="cta-card grain relative overflow-hidden rounded-[2.5rem] bg-night text-white">
        <div aria-hidden className="animate-drift pointer-events-none absolute -top-40 -right-20 size-[36rem] rounded-full bg-red/15 blur-[140px]" />
        <div aria-hidden className="animate-drift-slow pointer-events-none absolute -bottom-60 -left-40 size-[36rem] rounded-full bg-teal/30 blur-[140px]" />

        <MotionConfig reducedMotion="user">
          <LayoutGroup id="cta">
            <div className="wrap relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[6fr_5fr] lg:items-center lg:gap-16 lg:py-28">
              <div>
                <h2 id="cta-title" className="font-display text-[clamp(2.75rem,6.5vw,6rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
                  <span className="cta-word block">Let ChaCha</span>{" "}
                  <span className="cta-word block">do the</span>{" "}
                  <span className="cta-word block">shopping.</span>
                </h2>
                <p className="mt-8 max-w-md text-lg text-white/85">
                  Free, no obligation, and no pressure to switch. Quotes move faster over the phone.
                </p>
                <div className="mt-10 flex flex-col gap-4 xs:flex-row xs:flex-wrap xs:items-center">
                  {/* The button lifts off and becomes the quote card on the right. A ghost holds its place. */}
                  <div className="relative h-14 sm:h-16">
                    <span aria-hidden className="invisible flex h-full items-center gap-3 pr-2 pl-7 text-lg font-semibold">
                      Get a free quote <span className="size-12" />
                    </span>
                    {!open && (
                      <motion.button
                        ref={trigger}
                        layoutId="cta-quote"
                        transition={morph}
                        type="button"
                        onClick={openCard}
                        aria-expanded={open}
                        aria-controls="cta-quote-panel"
                        style={{ borderRadius: 32 }}
                        className="group absolute inset-0 flex items-center justify-between gap-3 bg-red pr-2 pl-7 text-lg font-semibold text-white shadow-[0_8px_24px_-12px_rgb(208_20_44/0.6)] transition-colors hover:bg-red-deep"
                      >
                        <motion.span layout="position" className="whitespace-nowrap">
                          Get a free quote
                        </motion.span>
                        <motion.span layout="position" className="grid size-10 place-items-center rounded-full bg-white text-red sm:size-12">
                          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
                        </motion.span>
                      </motion.button>
                    )}
                  </div>
                  <a
                    href={contact.phoneHref}
                    className="inline-flex h-14 items-center justify-center rounded-full px-7 text-lg font-semibold ring-1 ring-white/40 transition-colors ring-inset hover:bg-white/10 sm:h-16"
                  >
                    Call {contact.phone}
                  </a>
                </div>
              </div>

              <div ref={panel} id="cta-quote-panel" className="relative lg:h-[39rem]">
                <AnimatePresence initial={false} mode="popLayout">
                  {open ? (
                    <motion.div
                      key="card"
                      layoutId="cta-quote"
                      transition={morph}
                      style={{ borderRadius: 32 }}
                      role="dialog"
                      aria-label="Get a free quote"
                      className="relative z-10 flex h-full min-h-[36rem] flex-col overflow-hidden bg-white p-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] sm:p-8"
                    >
                      <motion.div
                        className="flex-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.28, duration: 0.3 } }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      >
                        <QuoteCard onClose={close} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="photo"
                      layoutId="cta-photo"
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                      style={{ borderRadius: 32 }}
                      className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-full"
                    >
                      <Image
                        src={`/img/${images.cta.file}`}
                        alt={images.cta.alt}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        quality={90}
                        className="object-cover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </LayoutGroup>
        </MotionConfig>
      </div>
    </section>
  );
}
