"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { allProducts, categories } from "@/lib/content";
import { coverIcons } from "@/lib/icons";
import ImageSlot from "./ImageSlot";
import { Button } from "./ui";
import { RevealText } from "./motion";

const ALL = "All covers";
const productsWithCategory = categories.flatMap((c) => c.products.map((p) => ({ ...p, category: c.name })));

export default function Coverage() {
  const [filter, setFilter] = useState(ALL);
  const [active, setActive] = useState(allProducts[0].slug);
  const current = productsWithCategory.find((p) => p.slug === active)!;
  const CurrentIcon = coverIcons[current.slug];
  const groups = filter === ALL ? categories : categories.filter((c) => c.name === filter);

  const chooseFilter = (name: string) => {
    setFilter(name);
    const first = (name === ALL ? categories : categories.filter((c) => c.name === name))[0].products[0];
    setActive(first.slug);
  };

  return (
    <section id="coverage" aria-labelledby="coverage-title" className="scroll-mt-24 py-28 sm:py-36 lg:py-44">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <RevealText
            id="coverage-title"
            className="font-display max-w-4xl text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em]"
          >
            Eleven kinds of cover, one agency to call.
          </RevealText>
          <p className="max-w-sm text-lg text-slate">
            From your first car to your growing business. Pick a cover to see what it does.
          </p>
        </div>

        {/* Category filter */}
        <LayoutGroup id="coverage-filter">
          <div
            role="tablist"
            aria-label="Filter covers"
            className="no-scrollbar -mx-4 mt-12 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:inline-flex sm:rounded-full sm:bg-white sm:p-1.5 sm:ring-1 sm:ring-ink/5 lg:mt-16"
          >
            {[ALL, ...categories.map((c) => c.name)].map((name) => {
              const on = filter === name;
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => chooseFilter(name)}
                  className={clsx(
                    "relative min-h-11 shrink-0 rounded-full px-5 text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-300",
                    on ? "text-white" : "text-slate hover:text-ink",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="coverage-filter-pill"
                      className="absolute inset-0 rounded-full bg-night"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{name}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[7fr_5fr] lg:gap-16">
          {/* list */}
          <div className="space-y-12">
            <AnimatePresence mode="popLayout" initial={false}>
              {groups.map((cat) => (
                <motion.div
                  key={cat.name}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-baseline justify-between gap-4 pb-3">
                    <h3 className="text-base font-semibold text-ink">{cat.name}</h3>
                    <p className="text-sm text-slate">{cat.tagline}</p>
                  </div>
                  <ul className="border-t border-ink/15">
                    {cat.products.map((p) => {
                      const on = p.slug === active;
                      const Icon = coverIcons[p.slug];
                      return (
                        <li key={p.slug} className="border-b border-ink/15">
                          <button
                            type="button"
                            aria-expanded={on}
                            aria-controls={`cover-${p.slug}`}
                            onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setActive(p.slug)}
                            onFocus={() => setActive(p.slug)}
                            onClick={() => setActive(p.slug)}
                            className="group flex w-full items-center gap-4 py-5 text-left sm:gap-6 sm:py-6"
                          >
                            <span
                              aria-hidden
                              className={clsx(
                                "grid size-11 shrink-0 place-items-center rounded-2xl transition-all duration-500 ease-[var(--ease-out-expo)] sm:size-12",
                                on ? "bg-night text-white" : "bg-white text-ink/40 ring-1 ring-ink/5 group-hover:text-ink/70",
                              )}
                            >
                              <Icon className="size-5" strokeWidth={1.75} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={clsx(
                                  "font-display block text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none font-semibold tracking-[-0.03em] transition-[color,font-variation-settings] duration-500 ease-[var(--ease-out-expo)]",
                                  on ? "text-ink" : "text-ink/35 group-hover:text-ink/70",
                                )}
                                style={{ fontVariationSettings: `"wdth" ${on ? 118 : 100}` }}
                              >
                                {p.name}
                              </span>
                              {/* On wide screens the short description rides under the active name. */}
                              <span
                                className={clsx(
                                  "hidden overflow-hidden text-slate transition-[max-height,opacity,margin] duration-500 ease-[var(--ease-out-expo)] lg:block",
                                  on ? "mt-2 max-h-12 opacity-100" : "max-h-0 opacity-0",
                                )}
                              >
                                {p.blurb}
                              </span>
                            </span>
                            <span
                              aria-hidden
                              className={clsx(
                                "grid size-11 shrink-0 place-items-center rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]",
                                on ? "rotate-45 bg-night text-white" : "bg-white text-ink ring-1 ring-ink/10",
                              )}
                            >
                              <Plus className="size-5" />
                            </span>
                          </button>

                          {/* mobile / tablet inline detail */}
                          <AnimatePresence initial={false}>
                            {on && (
                              <motion.div
                                id={`cover-${p.slug}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden lg:hidden"
                              >
                                <div className="grid gap-5 pb-8 sm:grid-cols-[1fr_1.2fr] sm:items-end">
                                  <ImageSlot slot={p.image} className="rounded-3xl" sizes="(min-width: 640px) 45vw, 100vw" />
                                  <div>
                                    <p className="text-lg">{p.blurb}</p>
                                    <div className="mt-5 flex flex-wrap items-center gap-4">
                                      <Button href={`/get-a-quote?cover=${p.slug}`}>Get your {p.name} quote</Button>
                                      <Link
                                        href={`/${p.slug}`}
                                        className="font-medium underline decoration-ink/20 decoration-2 underline-offset-4 hover:decoration-teal"
                                      >
                                        How {p.name.toLowerCase()} cover works
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* desktop sticky preview */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="relative overflow-hidden rounded-[2rem] bg-mist">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={current.slug}
                    initial={{ clipPath: "inset(100% 0 0 0)" }}
                    animate={{ clipPath: "inset(0% 0 0 0)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* a slow drift keeps the photo alive without pulling focus */}
                    <motion.div initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "easeOut" }}>
                      <ImageSlot slot={current.image} sizes="40vw" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* category chip */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={current.category}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/85 py-1.5 pr-4 pl-1.5 text-sm font-medium backdrop-blur"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-night text-white">
                      <CurrentIcon className="size-3.5" strokeWidth={2} aria-hidden />
                    </span>
                    {current.category}
                  </motion.span>
                </AnimatePresence>

                {/* name over a soft scrim */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/60 to-transparent" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={current.slug}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display absolute bottom-5 left-6 text-3xl font-semibold tracking-tight text-white"
                  >
                    {current.name} insurance
                  </motion.p>
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <p className="max-w-md text-lg text-slate">{current.blurb}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-5">
                    <Button href={`/get-a-quote?cover=${current.slug}`}>Get your {current.name} quote</Button>
                    <Link
                      href={`/${current.slug}`}
                      className="group inline-flex items-center gap-1.5 font-medium text-ink"
                    >
                      <span className="underline decoration-ink/20 decoration-2 underline-offset-4 transition-colors group-hover:decoration-teal">
                        How it works
                      </span>
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
