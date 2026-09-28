"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, ChevronDown, Phone } from "lucide-react";
import { categories, contact, nav } from "@/lib/content";
import { coverIcons } from "@/lib/icons";
import { Button, Magnetic } from "./ui";

/** Every kind of cover, grouped: the "Insurance" dropdown on wide screens. */
function InsuranceMenu({ onPick }: { onPick: () => void }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_80px_-30px_rgb(10_34_41/0.45)] ring-1 ring-ink/5">
      <div className="grid grid-cols-4 gap-6 p-7">
        {categories.map((cat) => (
          <div key={cat.name}>
            <p className="text-xs font-semibold tracking-wide text-teal uppercase">{cat.name}</p>
            <p className="mt-1 min-h-10 text-sm text-slate">{cat.tagline}</p>
            <ul className="mt-4 space-y-1">
              {cat.products.map((p) => {
                const Icon = coverIcons[p.slug];
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/${p.slug}`}
                      onClick={onPick}
                      className="group/item -mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-porcelain focus-visible:bg-porcelain"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-porcelain text-teal transition-colors group-hover/item:bg-white">
                        <Icon className="size-[1.1rem]" strokeWidth={1.75} aria-hidden />
                      </span>
                      {p.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-6 border-t border-ink/5 bg-porcelain/60 px-7 py-4 text-sm">
        <p className="text-slate">Not sure what you need? We&apos;ll map it out with you, free.</p>
        <Link href="/insurance" onClick={onPick} className="group/all inline-flex items-center gap-1.5 font-semibold text-ink transition-colors hover:text-teal">
          See all insurance
          <ArrowUpRight className="size-4 transition-transform group-hover/all:translate-x-0.5 group-hover/all:-translate-y-0.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export default function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  // the "Insurance" dropdown: opens on hover or keyboard focus, closes a moment after the pointer leaves
  const [menu, setMenu] = useState(false);
  const closeT = useRef<number | undefined>(undefined);
  const showMenu = () => {
    window.clearTimeout(closeT.current);
    setMenu(true);
  };
  const hideMenu = (delay = 160) => {
    window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => setMenu(false), delay);
  };

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 24);
    const hide = y > prev && y > 400 && !open;
    setHidden(hide);
    if (hide) setMenu(false);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <div
          className={clsx(
            "relative mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-4 rounded-full pr-2 pl-4 transition-[background-color,box-shadow,backdrop-filter] duration-500 sm:h-[4.5rem] sm:pl-6",
            open
              ? "bg-white"
              : solid
                ? "bg-white/80 shadow-[0_12px_40px_-18px_rgb(10_34_41/0.35)] ring-1 ring-ink/5 backdrop-blur-xl"
                : "bg-transparent",
          )}
        >
          <Link href="/" aria-label="ChaCha Insurance home" className="relative shrink-0">
            <Image src="/chacha-logo.png" alt="ChaCha Insurance" width={210} height={100} priority className="h-11 w-auto sm:h-12" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => {
                const dropdown = item.href === "/insurance";
                return (
                  <li
                    key={item.href}
                    {...(dropdown && {
                      onMouseEnter: showMenu,
                      onMouseLeave: () => hideMenu(),
                      onFocus: showMenu,
                      onBlur: (e: React.FocusEvent) => !e.currentTarget.contains(e.relatedTarget) && hideMenu(0),
                    })}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenu(false)}
                      aria-expanded={dropdown ? menu : undefined}
                      aria-controls={dropdown ? "insurance-menu" : undefined}
                      className="group flex items-center gap-1 rounded-full px-4 py-2 text-[0.9375rem] font-medium text-ink/80 transition-colors hover:text-ink"
                    >
                      <span className="relative block overflow-hidden">
                        <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
                          {item.label}
                        </span>
                        <span aria-hidden className="absolute inset-x-0 top-full block text-teal transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
                          {item.label}
                        </span>
                      </span>
                      {dropdown && (
                        <ChevronDown aria-hidden className={clsx("size-4 text-ink/50 transition-transform duration-300", menu && "rotate-180 text-teal")} />
                      )}
                    </Link>
                    {dropdown && (
                      <AnimatePresence>
                        {menu && (
                          <motion.div
                            id="insurance-menu"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            // centred under the whole header bar; the top padding bridges the gap so the pointer can travel into it
                            className="absolute top-full left-1/2 w-[min(58rem,calc(100vw-2.5rem))] -translate-x-1/2 pt-3"
                          >
                            <InsuranceMenu onPick={() => setMenu(false)} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={contact.phoneHref}
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-[0.9375rem] font-semibold text-ink transition-colors hover:text-teal md:flex"
            >
              <Phone className="size-4 text-teal" aria-hidden />
              {contact.phone}
            </a>
            <div className="hidden sm:block">
              <Magnetic>
                <Button href="/get-a-quote">Get a free quote</Button>
              </Magnetic>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative grid size-12 place-items-center rounded-full bg-ink text-white lg:hidden"
            >
              <span className={clsx("absolute h-0.5 w-5 rounded bg-current transition-transform duration-300", open ? "rotate-45" : "-translate-y-1")} />
              <span className={clsx("absolute h-0.5 w-5 rounded bg-current transition-transform duration-300", open ? "-rotate-45" : "translate-y-1")} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            className="grain fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-night px-6 pt-28 pb-8 text-white lg:hidden"
          >
            <nav aria-label="Mobile" className="flex-1">
              <ul className="space-y-1">
                {[{ label: "Home", href: "/" }, ...nav].map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="font-display block py-1 text-5xl font-semibold tracking-tight transition-colors hover:text-seaglass xs:text-6xl"
                        style={{ fontVariationSettings: '"wdth" 115' }}
                      >
                        {item.label}
                      </Link>
                      {item.href === "/insurance" && (
                        // every kind of cover, compact, under the big "Insurance" link
                        <ul className="mt-2 mb-4 grid grid-cols-2 gap-x-4 gap-y-1">
                          {categories.flatMap((c) => c.products).map((p) => {
                            const Icon = coverIcons[p.slug];
                            return (
                              <li key={p.slug}>
                                <Link
                                  href={`/${p.slug}`}
                                  onClick={() => setOpen(false)}
                                  className="flex items-center gap-2.5 py-1.5 text-base text-white/75 transition-colors hover:text-white"
                                >
                                  <Icon className="size-4 text-seaglass" strokeWidth={1.75} aria-hidden />
                                  {p.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-4"
            >
              <Button href="/get-a-quote" size="lg" className="w-full justify-between">
                Get a free quote
              </Button>
              <a href={contact.phoneHref} className="flex items-center justify-center gap-2 py-2 font-semibold text-white/80">
                <Phone className="size-4" aria-hidden /> Call {contact.phone}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
