"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Phone } from "lucide-react";
import { contact, nav } from "@/lib/content";
import { Button, Magnetic } from "./ui";

export default function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 24);
    setHidden(y > prev && y > 400 && !open);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
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
            "mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-4 rounded-full pr-2 pl-4 transition-[background-color,box-shadow,backdrop-filter] duration-500 sm:h-[4.5rem] sm:pl-6",
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
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group block rounded-full px-4 py-2 text-[0.9375rem] font-medium text-ink/80 transition-colors hover:text-ink"
                  >
                    <span className="relative block overflow-hidden">
                      <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
                        {item.label}
                      </span>
                      <span aria-hidden className="absolute inset-x-0 top-full block text-teal transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
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
            className="grain fixed inset-0 z-40 flex flex-col bg-night px-6 pt-28 pb-8 text-white lg:hidden"
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
