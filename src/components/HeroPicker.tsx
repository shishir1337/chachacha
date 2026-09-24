"use client";

import clsx from "clsx";
import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Layers } from "lucide-react";
import { allProducts } from "@/lib/content";
import { coverIcons } from "@/lib/icons";
import { Button } from "./ui";

const options = [
  ...allProducts.map((p) => ({ value: p.slug, label: p.name, blurb: p.blurb, Icon: coverIcons[p.slug] })),
  {
    value: "bundle",
    label: "Bundle",
    blurb: "Tell us everything you want covered. We price it together and look for multi-policy discounts.",
    Icon: Layers,
  },
];

/**
 * A compact, single-strip cover picker that sits right under the "Cha Cha Cha" stage,
 * so choosing a cover and watching its scene happen in the same view.
 */
export default function HeroPicker({
  value,
  onPick,
  className,
}: {
  value: string | null;
  onPick: (value: string) => void;
  className?: string;
}) {
  const labelId = useId();
  const current = options.find((o) => o.value === value) ?? null;
  const href = current ? `/get-a-quote?cover=${current.value}` : "/get-a-quote";
  const cta = !current ? "Get a free quote" : current.value === "bundle" ? "Quote my bundle" : `Get my ${current.label} quote`;

  return (
    <div
      className={clsx(
        "rounded-[1.75rem] bg-white/85 p-3 shadow-[0_30px_70px_-50px_rgb(10_34_41/0.45)] ring-1 ring-ink/5 backdrop-blur-xl sm:p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-2">
        <div className="min-w-0">
          <h2 id={labelId} className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            What do you need covered?
          </h2>
          <div className="relative mt-0.5 h-10 overflow-hidden sm:h-6" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={current?.value ?? "none"}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="line-clamp-2 text-sm text-slate sm:line-clamp-1"
              >
                {current ? current.blurb : "Pick a cover and watch it move in under the roof."}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <div className="hidden shrink-0 sm:block">
          <Button href={href}>{cta}</Button>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={(e) => {
          const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          const i = options.findIndex((o) => o.value === value);
          const next = options[(i + step + options.length) % options.length];
          onPick(next.value);
          (e.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus();
        }}
        className="no-scrollbar -mx-3 mt-3 flex gap-1.5 overflow-x-auto lg:gap-1 xl:gap-1.5 px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-1 sm:pb-0"
      >
        {options.map(({ value: v, label, Icon }) => {
          const active = v === value;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={active}
              data-value={v}
              tabIndex={active || (!value && v === options[0].value) ? 0 : -1}
              onClick={() => onPick(v)}
              className={clsx(
                "relative inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full pr-3.5 pl-3 text-[0.9375rem] font-medium lg:gap-1 lg:pr-2.5 lg:pl-2 lg:text-[0.875rem] xl:pr-3.5 xl:pl-3 xl:text-[0.9375rem] transition-colors duration-200 active:scale-[0.97]",
                active ? "text-white" : "bg-porcelain text-ink hover:bg-mist",
              )}
            >
              {active && (
                <motion.span
                  layoutId="hero-picker-pill"
                  className="absolute inset-0 rounded-full bg-night"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <Icon className={clsx("relative size-4", active ? "text-seaglass" : "text-teal")} strokeWidth={1.9} aria-hidden />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>

      <Button href={href} className="mt-3 w-full justify-between sm:hidden">
        {cta}
      </Button>
    </div>
  );
}
