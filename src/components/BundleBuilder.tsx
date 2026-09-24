"use client";

import clsx from "clsx";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { coverIcons as icons } from "@/lib/icons";
import { allProducts } from "@/lib/content";
import { RevealText } from "./motion";
import { Button, Roof } from "./ui";



const spring = { type: "spring", stiffness: 320, damping: 30 } as const;

export default function BundleBuilder() {
  const [picked, setPicked] = useState<string[]>(["auto-insurance", "homeowners-insurance"]);
  const toggle = (slug: string) =>
    setPicked((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  const covered = picked.map((slug) => allProducts.find((p) => p.slug === slug)!);
  const n = covered.length;

  return (
    <section aria-labelledby="bundle-title" className="relative overflow-hidden bg-white py-28 sm:py-36 lg:py-44">
      <div className="wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-3 text-base font-semibold text-teal">
            <Roof className="h-4 w-10 text-red" />
            One agent, every policy
          </p>
          <RevealText
            id="bundle-title"
            className="font-display mt-5 text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em]"
          >
            Everything you care about, under one roof.
          </RevealText>
          <p className="mt-6 text-lg text-slate">
            Tap what you want covered and watch the roof stretch to fit. One agent looks after all of it, and putting
            policies together often unlocks multi-policy discounts.
          </p>
        </div>

        <LayoutGroup>
          {/* The house: a roof that grows to cover everything chosen. */}
          <div className="mt-16 flex justify-center sm:mt-20">
            <motion.div layout transition={spring} className="relative max-w-full px-3 pt-14 sm:px-6 sm:pt-20">
              <motion.svg
                layout
                transition={spring}
                aria-hidden
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-0 h-14 w-full text-red sm:h-20"
                fill="none"
              >
                <path
                  d="M1 48 C 22 44, 36 16, 50 3 C 64 16, 78 44, 99 48"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </motion.svg>

              <motion.ul
                layout
                transition={spring}
                aria-label="Covered under your roof"
                className="flex min-h-[8.5rem] flex-wrap items-end justify-center gap-3 sm:min-h-[9.5rem] sm:gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {n === 0 && (
                    <motion.li
                      key="empty"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid h-32 w-[min(18rem,70vw)] place-items-center rounded-3xl border border-dashed border-ink/15 px-6 text-center text-sm text-slate sm:h-36"
                    >
                      Nothing under your roof yet. Pick a cover below.
                    </motion.li>
                  )}
                </AnimatePresence>
                {covered.map((p) => {
                  const Icon = icons[p.slug];
                  return (
                    <motion.li key={p.slug} layout transition={spring}>
                      <motion.button
                        layoutId={`cover-${p.slug}`}
                        transition={spring}
                        type="button"
                        onClick={() => toggle(p.slug)}
                        aria-label={`Remove ${p.name} insurance`}
                        className="group relative flex h-32 w-24 flex-col items-center justify-center gap-3 rounded-3xl bg-porcelain text-ink transition-colors hover:bg-mist sm:h-36 sm:w-28"
                      >
                        <span className="grid size-12 place-items-center rounded-2xl bg-white shadow-[0_8px_20px_-14px_rgb(10_34_41/0.5)]">
                          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                        </span>
                        <span className="text-sm font-medium">{p.name}</span>
                        <span
                          aria-hidden
                          className="absolute top-2 right-2 grid size-5 place-items-center rounded-full text-xs text-slate opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          &times;
                        </span>
                      </motion.button>
                    </motion.li>
                  );
                })}
              </motion.ul>

              {/* floor */}
              <motion.div layout transition={spring} aria-hidden className="mt-4 h-px w-full bg-ink/10" />
            </motion.div>
          </div>

          <motion.div layout="position" transition={spring} className="mt-10 flex flex-col items-center gap-5 text-center">
            <p className="text-slate" aria-live="polite">
              {n === 0
                ? "Your roof is empty."
                : n === 1
                  ? "One policy under your roof. Add another to see if a bundle beats it."
                  : `${n} policies under one roof. One agent, one number to call.`}
            </p>
            <Button href="/get-a-quote?cover=bundle">{n > 1 ? "Quote my bundle" : "Get my quote"}</Button>
          </motion.div>

          {/* The tray of covers still to choose from. */}
          <div className="mx-auto mt-16 max-w-4xl border-t border-ink/8 pt-10">
            <p className="text-center text-sm font-medium text-slate">Add to your roof</p>
            <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
              {allProducts.map((p) => {
                const Icon = icons[p.slug];
                const on = picked.includes(p.slug);
                return (
                  <li key={p.slug} className="relative">
                    {/* A ghost keeps the tray steady while the real tile lives under the roof. */}
                    <span
                      aria-hidden
                      className={clsx(
                        "flex h-12 items-center gap-2 rounded-full border border-dashed border-ink/15 pr-5 pl-4 text-[0.9375rem] font-medium text-ink/30",
                        !on && "invisible",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                      {p.name}
                    </span>
                    {!on && (
                      <motion.button
                        layoutId={`cover-${p.slug}`}
                        transition={spring}
                        type="button"
                        onClick={() => toggle(p.slug)}
                        aria-label={`Add ${p.name} insurance`}
                        className="absolute inset-0 flex items-center gap-2 rounded-full bg-porcelain pr-5 pl-4 text-[0.9375rem] font-medium text-ink ring-1 ring-transparent transition-[background-color,box-shadow] hover:bg-white hover:shadow-[0_10px_24px_-16px_rgb(10_34_41/0.5)] hover:ring-ink/10"
                      >
                        <Icon className="size-4 text-teal" strokeWidth={1.75} aria-hidden />
                        {p.name}
                      </motion.button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
