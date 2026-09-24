"use client";

import { useRef } from "react";
import { Headset, Lightbulb, Scale, Sparkles, type LucideIcon } from "lucide-react";
import { reasons } from "@/lib/content";
import ImageSlot from "./ImageSlot";
import { RevealText } from "./motion";

const icons: LucideIcon[] = [Headset, Lightbulb, Scale, Sparkles];

function Spotlight({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden rounded-[2rem] bg-white p-7 sm:p-9 ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx) var(--my), rgb(47 156 146 / 0.08), transparent 60%)" }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

export default function WhyUs() {
  return (
    <section aria-labelledby="why-title" className="py-28 sm:py-36 lg:py-44">
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="text-base font-semibold text-teal">Why ChaCha</p>
          <RevealText id="why-title" className="font-display mt-5 text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em]">
            Four good reasons to let us do the shopping.
          </RevealText>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
          <div className="relative overflow-hidden rounded-[2rem] md:col-span-2 lg:col-span-4 lg:row-span-2">
            <ImageSlot slot="why" fill className="min-h-[26rem]" sizes="(min-width: 1024px) 33vw, 100vw" />
          </div>
          {reasons.map((r, i) => {
            const Icon = icons[i];
            return (
              <Spotlight key={r.title} className={i === 0 || i === 3 ? "lg:col-span-5" : "lg:col-span-3"}>
                <div className="flex h-full flex-col justify-between gap-12">
                  <span className="grid size-14 place-items-center rounded-2xl bg-porcelain text-teal transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-6 group-hover:scale-110">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-xl leading-tight font-bold tracking-tight sm:text-2xl">{r.title}</h3>
                    <p className="mt-3 text-slate">{r.body}</p>
                  </div>
                </div>
              </Spotlight>
            );
          })}
        </div>
      </div>
    </section>
  );
}
