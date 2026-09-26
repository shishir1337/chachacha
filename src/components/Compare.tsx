"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Check, Minus } from "lucide-react";
import { compareRows } from "@/lib/content";
import { roofie } from "./Mascot";

type Side = "captive" | "chacha";

export default function Compare() {
  const [side, setSide] = useState<Side>("captive");
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25, once: true });

  // Flip to the ChaCha side once, shortly after the table comes into view, unless the visitor already chose.
  useEffect(() => {
    if (!inView || touched) return;
    const t = setTimeout(() => setSide("chacha"), 350);
    return () => clearTimeout(t);
  }, [inView, touched]);

  // The uncle approves when the table shows the ChaCha side.
  useEffect(() => {
    if (side === "chacha" && inView) roofie("approve");
  }, [side, inView]);

  const choose = (s: Side) => {
    setTouched(true);
    setSide(s);
  };
  const us = side === "chacha";

  return (
    <section aria-labelledby="compare-title" className="bg-white py-28 sm:py-36 lg:py-44">
      <div className="wrap grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-base font-semibold text-teal">Independent vs captive</p>
          <h2 id="compare-title" className="font-display mt-5 text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em]">
            Not tied to any one insurance company.
          </h2>
          <p className="mt-6 max-w-md text-lg text-slate">
            A captive agent can only sell the policies of the company that employs them. We can go anywhere. Flip the switch to
            see what that changes.
          </p>
          <p className="mt-6 max-w-md text-sm text-slate">
            You never pay us a fee. The insurer you choose pays our commission, and buying through us costs no more than going
            direct.
          </p>
        </div>

        <div ref={ref}>
          <div role="radiogroup" aria-label="Compare" className="inline-flex rounded-full bg-porcelain p-1.5">
            {(
              [
                ["captive", "A captive agent"],
                ["chacha", "ChaCha"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={side === value}
                onClick={() => choose(value)}
                className={clsx(
                  "relative min-h-12 rounded-full px-5 text-[0.9375rem] font-semibold transition-colors duration-300 sm:px-7",
                  side === value ? "text-white" : "text-ink/70 hover:text-ink",
                )}
              >
                {side === value && (
                  <motion.span
                    layoutId="compare-pill"
                    className={clsx("absolute inset-0 rounded-full", value === "chacha" ? "bg-teal" : "bg-night")}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          <dl className="mt-10 border-t border-teal/15" aria-live="polite">
            {compareRows.map((row, i) => (
              <div key={row.topic} className="grid gap-2 border-b border-teal/15 py-6 sm:grid-cols-[14rem_1fr] sm:gap-8">
                <dt className="text-sm font-medium text-slate sm:pt-1.5">{row.topic}</dt>
                <dd className="relative flex items-start gap-4">
                  <motion.span
                    animate={{ backgroundColor: us ? "#1b6b66" : "#f2f3f6", color: us ? "#ffffff" : "#5c5864", scale: us ? [0.6, 1.15, 1] : 1 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full"
                    aria-hidden
                  >
                    {us ? <Check className="size-4" strokeWidth={3} /> : <Minus className="size-4" strokeWidth={3} />}
                  </motion.span>
                  <span className="grid flex-1 overflow-hidden">
                    {(["captive", "chacha"] as const).map((s) => {
                      const shown = side === s;
                      return (
                        <span
                          key={s}
                          aria-hidden={!shown}
                          className={clsx(
                            "font-display col-start-1 row-start-1 block text-lg leading-snug font-medium tracking-tight transition-[transform,opacity] duration-300 ease-[var(--ease-out-expo)] sm:text-xl",
                            s === "chacha" ? "text-ink" : "text-ink/55",
                            shown ? "translate-y-0 opacity-100" : s === "chacha" ? "translate-y-full opacity-0" : "-translate-y-full opacity-0",
                          )}
                          style={{ transitionDelay: `${i * 30}ms` }}
                        >
                          {s === "chacha" ? row.chacha : row.captive}
                        </span>
                      );
                    })}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
