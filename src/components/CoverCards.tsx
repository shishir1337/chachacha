"use client";

import Image from "next/image";
import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Layers } from "lucide-react";
import { allProducts } from "@/lib/content";
import { coverIcons } from "@/lib/icons";
import { images, type ImageSpec } from "@/lib/images";

const photo = (slug: string): ImageSpec => images[allProducts.find((p) => p.slug === slug)!.image];
const BUNDLE = ["auto-insurance", "homeowners-insurance", "life-insurance", "business-insurance"];
const IDLE = ["life-insurance", "homeowners-insurance", "auto-insurance"];

/** A printed photo card: a white border, the picture, and a caption strip. */
function Card({ slug, stamp, eager }: { slug: string; stamp?: boolean; eager?: boolean }) {
  const bundle = slug === "bundle";
  const product = allProducts.find((p) => p.slug === slug);
  const Icon = bundle ? Layers : coverIcons[slug];
  const reduce = useReducedMotion();

  return (
    <div className="relative h-full w-full rounded-[1.25rem] bg-white p-2 shadow-[0_24px_50px_-24px_rgb(10_34_41/0.55)] ring-1 ring-ink/5">
      <div className="relative h-[calc(100%-2.5rem)] overflow-hidden rounded-[0.8rem] bg-mist">
        {bundle ? (
          <div className="grid h-full grid-cols-2 grid-rows-2 gap-1">
            {BUNDLE.map((s) => {
              const spec = photo(s);
              return (
                <div key={s} className="relative overflow-hidden">
                  <Image src={`/img/${spec.file}`} alt="" fill sizes="120px" quality={90} className="object-cover" style={{ objectPosition: spec.position }} />
                </div>
              );
            })}
          </div>
        ) : (
          (() => {
            const spec = photo(slug);
            if (!spec.ready)
              return (
                <div className="grid h-full place-items-center bg-gradient-to-b from-foam to-mist">
                  <Icon className="size-12 text-teal/70" strokeWidth={1.25} aria-hidden />
                </div>
              );
            return (
              <Image
                src={`/img/${spec.file}`}
                alt={spec.alt}
                fill
                sizes="(min-width: 1280px) 240px, 200px"
                quality={90}
                loading={eager ? "eager" : undefined}
                className="object-cover"
                style={{ objectPosition: spec.position }}
              />
            );
          })()
        )}
      </div>
      <div className="flex h-10 items-center gap-2 px-1.5">
        <Icon className="size-4 text-teal" strokeWidth={1.9} aria-hidden />
        <span className="truncate text-sm font-semibold">{bundle ? "Your bundle" : `${product!.name} insurance`}</span>
      </div>

      {stamp && (
        <motion.span
          aria-hidden
          initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: -14 }}
          transition={reduce ? { duration: 0 } : { delay: 1.9, type: "spring", stiffness: 520, damping: 18 }}
          className="absolute top-4 right-3 grid size-[4.5rem] place-items-center rounded-full border-2 border-teal bg-white/85 text-teal backdrop-blur-sm"
        >
          <span className="flex flex-col items-center leading-none">
            <Check className="size-5" strokeWidth={3} />
            <span className="mt-1 text-[0.8125rem] font-bold tracking-tight">Covered</span>
          </span>
          <span className="absolute inset-1 rounded-full border border-dashed border-teal/50" />
        </motion.span>
      )}
    </div>
  );
}

/**
 * The hand of policy cards in the hero. Idle, three photos fan out and float.
 * Pick a cover and its card is dealt on top while its scene plays, then stamped "Covered".
 */
export default function CoverCards({ cover, dealKey, className }: { cover: string | null; dealKey: number; className?: string }) {
  const reduce = useReducedMotion();
  const fan = [
    { rotate: -11, x: -34, y: 10 },
    { rotate: -3, x: -12, y: 2 },
    { rotate: 6, x: 10, y: 0 },
  ];

  return (
    <div aria-hidden className={className}>
      <div className="relative h-[13.5rem] w-[10.75rem] xl:h-[15.5rem] xl:w-[12.25rem]">
      {/* the resting hand */}
      {IDLE.map((slug, i) => (
        <motion.div
          key={slug}
          className="absolute inset-0"
          initial={false}
          animate={
            cover
              ? { rotate: fan[i].rotate * 0.6 - 4, x: fan[i].x * 0.6 - 18, y: 10, opacity: 0.55, scale: 0.94 }
              : { rotate: fan[i].rotate, x: fan[i].x, y: fan[i].y, opacity: 1, scale: 1 }
          }
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <div className={reduce ? "h-full" : "h-full animate-[float_6s_ease-in-out_infinite]"} style={{ animationDelay: `${i * -2}s` }}>
            <Card slug={slug} eager />
          </div>
        </motion.div>
      ))}

      {/* the dealt card */}
      <AnimatePresence>
        {cover && (
          <motion.div
            key={dealKey}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { x: -140, y: 90, rotate: -24, opacity: 0, scale: 0.85 }}
            animate={{ x: 14, y: -6, rotate: 5, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { x: 160, y: -30, rotate: 22, opacity: 0, transition: { duration: 0.45, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", stiffness: 190, damping: 20, mass: 0.9 }}
          >
            <Card slug={cover} stamp />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
