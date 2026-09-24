"use client";

import Image from "next/image";
import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Check, HelpCircle, Layers, Loader2, X } from "lucide-react";
import { allProducts, contact } from "@/lib/content";
import { coverIcons } from "@/lib/icons";
import { images } from "@/lib/images";

const covers = [
  ...allProducts.map((p) => ({ value: p.slug, label: p.name, Icon: coverIcons[p.slug] })),
  { value: "bundle", label: "Several", Icon: Layers },
  { value: "not-sure", label: "Not sure yet", Icon: HelpCircle },
];

type Fields = { name: string; email: string; phone: string; zip: string; notes: string; website: string };
type Errors = Partial<Record<keyof Fields, string>>;

const STEPS = ["What do you need covered?", "Where should we send it?", "Anything we should know?"];

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter an email like you@example.com.";
  if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10 digit phone number.";
  if (f.zip && !/^\d{5}$/.test(f.zip.trim())) e.zip = "ZIP codes are 5 digits.";
  return e;
}

/**
 * The quote card the call-to-action button grows into.
 * One question at a time; a roof line fills in as each step is done.
 */
export default function QuoteCard({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();
  const id = useId();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [cover, setCover] = useState<string | null>(null);
  const [f, setF] = useState<Fields>({ name: "", email: "", phone: "", zip: "", notes: "", website: "" });
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const firstRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const errors = validate(f);
  const done = status === "done";
  const progress = done ? 1 : step / 3;
  const coverLabel = covers.find((c) => c.value === cover)?.label;

  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (step > 0 || done) headingRef.current?.focus({ preventScroll: true });
  }, [step, done]);

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((cur) => ({ ...cur, [k]: e.target.value }));
  const blur = (k: keyof Fields) => () => setTouched((t) => ({ ...t, [k]: true }));
  const show = (k: keyof Fields) => touched[k] && errors[k];

  const next = () => {
    if (step === 1) {
      setTouched({ name: true, email: true, phone: true, zip: true });
      const first = (["name", "email", "phone", "zip"] as const).find((k) => errors[k]);
      if (first) {
        document.getElementById(`${id}-${first}`)?.focus();
        return;
      }
    }
    go(step + 1);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 2) return next();
    setStatus("sending");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover, ...f }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const slide = {
    initial: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * 36, filter: "blur(4px)" }),
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * -36, filter: "blur(4px)" }),
  };

  const input =
    "mt-1.5 block h-12 w-full rounded-xl bg-porcelain px-4 text-base text-ink ring-1 ring-transparent transition-shadow outline-none placeholder:text-slate/60 focus:bg-white focus:ring-2 focus:ring-teal aria-[invalid=true]:ring-red/60";

  return (
    <div className="relative flex h-full flex-col text-ink">
      {/* header: the photo shrinks into a thumbnail, the roof shows progress */}
      <div className="flex items-center gap-3">
        <motion.div layoutId="cta-photo" className="relative size-11 shrink-0 overflow-hidden rounded-full" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
          <Image src={`/img/${images.cta.file}`} alt="" fill sizes="44px" quality={90} className="object-cover" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight font-semibold tracking-tight">Your free quote</p>
          <p className="text-sm text-slate">{done ? "Request sent" : `Step ${step + 1} of 3`}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the quote form"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-porcelain text-ink transition-colors hover:bg-mist"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="relative mt-4">
      <svg aria-hidden viewBox="0 0 400 60" className="h-9 w-full overflow-visible" fill="none" preserveAspectRatio="none">
        <path d="M4 56 C 90 50, 150 16, 200 4 C 250 16, 310 50, 396 56" stroke="rgb(29 26 32 / 0.08)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <motion.path
          d="M4 56 C 90 50, 150 16, 200 4 C 250 16, 310 50, 396 56"
          stroke="#d0142c"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: progress, opacity: progress > 0 ? 1 : 0 }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
        <AnimatePresence>
          {done && (
            <motion.span
              aria-hidden
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.75, type: "spring", stiffness: 500, damping: 15 }}
              className="absolute top-[45%] left-1/2 -ml-1.5 size-3 rounded-[2px] bg-red"
            />
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={submit} noValidate className="relative mt-3 flex flex-1 flex-col">
        {/* honeypot */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-full flex-col items-start justify-center py-6"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 420, damping: 16 }}
                  className="grid size-14 place-items-center rounded-2xl bg-red text-white"
                >
                  <Check className="size-7" strokeWidth={2.5} />
                </motion.span>
                <h3 ref={headingRef} tabIndex={-1} className="font-display mt-6 text-3xl leading-tight font-semibold tracking-tight outline-none">
                  Thanks, {f.name.trim().split(" ")[0]}. We are on it.
                </h3>
                <p className="mt-3 max-w-sm text-slate">
                  We will compare carriers for your {coverLabel?.toLowerCase() === "several" ? "bundle" : `${coverLabel?.toLowerCase()} cover`} and
                  call you on {f.phone}. Office hours: {contact.hours}.
                </p>
              </motion.div>
            ) : (
              <motion.fieldset
                key={step}
                custom={dir}
                variants={slide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <legend className="w-full">
                  <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl leading-tight font-semibold tracking-tight outline-none sm:text-[1.75rem]">
                    {STEPS[step]}
                  </h3>
                </legend>

                {step === 0 && (
                  <div role="radiogroup" aria-label="Kind of cover" className="mt-5 grid grid-cols-2 gap-2 xs:grid-cols-3">
                    {covers.map(({ value, label, Icon }, i) => {
                      const on = cover === value;
                      return (
                        <motion.button
                          key={value}
                          ref={i === 0 ? firstRef : undefined}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          initial={reduce ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + i * 0.03, duration: 0.4 }}
                          onClick={() => {
                            setCover(value);
                            setTimeout(() => go(1), 280);
                          }}
                          className={clsx(
                            "flex min-h-12 items-center gap-2 rounded-xl px-3 text-left text-[0.9375rem] font-medium transition-colors",
                            on ? "bg-night text-white" : "bg-porcelain hover:bg-mist",
                          )}
                        >
                          <Icon className={clsx("size-4 shrink-0", on ? "text-seaglass" : "text-teal")} strokeWidth={1.9} aria-hidden />
                          {label}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {step === 1 && (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ["name", "Full name", "text", "name", "sm:col-span-2"],
                        ["email", "Email", "email", "email", ""],
                        ["phone", "Phone", "tel", "tel", ""],
                        ["zip", "ZIP code (optional)", "text", "postal-code", ""],
                      ] as const
                    ).map(([k, label, type, auto, span]) => (
                      <div key={k} className={span}>
                        <label htmlFor={`${id}-${k}`} className="text-sm font-medium">
                          {label}
                          {k !== "zip" && <span className="text-red"> *</span>}
                        </label>
                        <input
                          id={`${id}-${k}`}
                          type={type}
                          inputMode={k === "zip" ? "numeric" : undefined}
                          autoComplete={auto}
                          value={f[k]}
                          onChange={set(k)}
                          onBlur={blur(k)}
                          aria-invalid={!!show(k)}
                          aria-describedby={show(k) ? `${id}-${k}-err` : k === "phone" ? `${id}-phone-hint` : undefined}
                          className={input}
                        />
                        {show(k) ? (
                          <p id={`${id}-${k}-err`} role="alert" className="mt-1.5 text-sm text-red">
                            {errors[k]}
                          </p>
                        ) : k === "phone" ? (
                          <p id={`${id}-phone-hint`} className="mt-1.5 text-sm text-slate">
                            Quotes move faster over the phone.
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="mt-5">
                    <label htmlFor={`${id}-notes`} className="text-sm font-medium">
                      Notes (optional)
                    </label>
                    <textarea
                      id={`${id}-notes`}
                      rows={4}
                      value={f.notes}
                      onChange={set("notes")}
                      placeholder="Current carrier, renewal date, vehicles or property to include"
                      className={clsx(input, "h-auto resize-none py-3")}
                    />
                    <p className="mt-3 text-sm text-slate">We use your details only to prepare your quote.</p>
                    {status === "error" && (
                      <p role="alert" className="mt-3 text-sm text-red">
                        We could not send your request. Try again, or call us on {contact.phone}.
                      </p>
                    )}
                  </div>
                )}
              </motion.fieldset>
            )}
          </AnimatePresence>
        </div>

        {!done && step > 0 && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-medium text-slate transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4" aria-hidden /> Back
            </button>
            <button
              type="submit"
              disabled={status === "sending"}
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-red pr-2 pl-6 font-semibold text-white transition-colors hover:bg-red-deep disabled:opacity-70"
            >
              {step < 2 ? "Continue" : status === "sending" ? "Sending" : "Request my quote"}
              <span className="grid size-8 place-items-center rounded-full bg-white text-red">
                {status === "sending" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
                )}
              </span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
