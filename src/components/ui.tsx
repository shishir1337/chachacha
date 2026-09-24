"use client";

import Link from "next/link";
import clsx from "clsx";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

/** Pulls its child gently toward the pointer. */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x, y }}
      className={clsx("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}

type BtnProps = {
  href: string;
  children: React.ReactNode;
  variant?: "red" | "ink" | "white" | "ghost";
  size?: "md" | "lg";
  className?: string;
  icon?: boolean;
};

export function Button({ href, children, variant = "red", size = "md", className, icon = true }: BtnProps) {
  const external = href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");
  const classes = clsx(
    "group relative inline-flex items-center gap-3 overflow-hidden rounded-full font-semibold transition-[color,box-shadow] duration-300 active:scale-[0.97]",
    size === "md" ? "h-12 pl-6 pr-2 text-[0.9375rem]" : "h-14 pl-7 pr-2 text-base sm:h-16 sm:text-lg",
    !icon && (size === "md" ? "pr-6" : "pr-7"),
    variant === "red" && "bg-red text-white shadow-[0_8px_24px_-12px_rgb(208_20_44/0.45)] hover:text-white",
    variant === "ink" && "bg-ink text-white hover:text-white",
    variant === "white" && "bg-white text-ink hover:text-white",
    variant === "ghost" && "text-ink ring-1 ring-ink/15 ring-inset hover:text-white",
    className,
  );
  const fill = clsx(
    "absolute inset-0 -z-0 origin-bottom scale-y-0 rounded-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100",
    variant === "red" ? "bg-red-deep" : variant === "ink" ? "bg-teal" : variant === "white" ? "bg-night" : "bg-ink",
  );
  const inner = (
    <>
      <span aria-hidden className={fill} />
      <span className="relative z-10">{children}</span>
      {icon && (
        <span
          aria-hidden
          className={clsx(
            "relative z-10 grid place-items-center overflow-hidden rounded-full transition-colors duration-300",
            size === "md" ? "size-8" : "size-10 sm:size-12",
            variant === "white" || variant === "ghost" ? "bg-night text-white group-hover:bg-white group-hover:text-night" : "bg-white text-red",
          )}
        >
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-5 group-hover:-translate-y-5" />
          <ArrowUpRight className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0" />
        </span>
      )}
    </>
  );
  if (external) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}

/** Small roof curve borrowed from the logo mark. Used as a section marker. */
export function Roof({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 22" fill="none" aria-hidden className={className}>
      <path d="M2 20 C 14 18, 22 4, 34 3 C 44 2, 54 10, 62 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
