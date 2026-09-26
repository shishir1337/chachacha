"use client";

import clsx from "clsx";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { contact, faqs } from "@/lib/content";
import { Button } from "./ui";
import { RevealText } from "./motion";
import { roofie } from "./Mascot";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section aria-labelledby="faq-title" className="py-28 sm:py-36 lg:py-44">
      <div className="wrap grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <RevealText id="faq-title" className="font-display text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em]">
            Questions people ask before they switch.
          </RevealText>
          <p className="mt-6 max-w-md text-lg text-slate">Still unsure? A five minute call usually clears it up.</p>
          <p className="mt-3 max-w-md text-slate">
            Already a client? You can{" "}
            <a href="/service" className="font-medium text-ink underline decoration-teal/50 decoration-2 underline-offset-4 hover:decoration-teal">
              request service online
            </a>
            .
          </p>
          <div className="mt-8">
            <Button href={contact.phoneHref} variant="ink">
              Call {contact.phone}
            </Button>
          </div>
        </div>

        <ul className="border-t border-ink/15">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            const id = `${base}-${i}`;
            return (
              <li key={f.q} className="border-b border-ink/15">
                <h3>
                  <button
                    type="button"
                    id={`${id}-btn`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-panel`}
                    onClick={() => {
                      if (!isOpen) roofie("think");
                      setOpen(isOpen ? null : i);
                    }}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={clsx(
                        "font-display text-lg leading-snug font-semibold tracking-tight transition-colors sm:text-xl",
                        isOpen ? "text-teal" : "group-hover:text-teal",
                      )}
                    >
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className={clsx(
                        "grid size-10 shrink-0 place-items-center rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]",
                        isOpen ? "rotate-[135deg] bg-teal text-white" : "bg-white text-ink ring-1 ring-ink/10",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${id}-panel`}
                      role="region"
                      aria-labelledby={`${id}-btn`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pr-14 pb-7 text-slate">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
