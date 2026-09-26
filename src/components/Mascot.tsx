"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { contact } from "@/lib/content";
import { coverIcons } from "@/lib/icons";
import { INTRO_DELAY } from "./motion";

/** Other parts of the page talk to the uncle with small window events. */
export const roofie = (name: "cover" | "cheer" | "pick" | "form" | "think" | "approve" | "look", detail?: string) =>
  window.dispatchEvent(new CustomEvent(`roofie:${name}`, { detail }));

/** Tells the footer wordmark to show (or hide) the uncle asleep inside its "C". */
const nap = (on: boolean) => window.dispatchEvent(new CustomEvent("roofie:nap", { detail: on }));

const STORE = "roofie-hidden";

type Pose = "stand" | "sit";
type Pt = { x: number; y: number };
type Station = {
  key: string;
  /** element he goes to */
  anchor: string;
  /** the point he stands or sits on (viewport pixels) */
  spot: (r: DOMRect, el: Element) => Pt | null;
  pose: Pose;
  /** at the footer he climbs into the "C" and naps (drawn by the wordmark) */
  nap?: boolean;
  greet?: "wave" | "salute";
  /** elements whose top edge he may slide along to find a clear seat (defaults to the anchor) */
  surface?: string;
  /** only look for text and buttons inside the anchor (for content that scrolls on its own) */
  scopeAnchor?: boolean;
};

type Box = { l: number; t: number; r: number; b: number };
const CONTROLS = "a, button, input, select, textarea, [role=radio], [role=tab]";

/** Everything he must never cover: button and link boxes, and the real glyph boxes of visible text. */
function obstacles(scope: Element, skip: Element): Box[] {
  const out: Box[] = [];
  const add = (q: DOMRect) => {
    if (q.width > 1 && q.height > 1) out.push({ l: q.left, t: q.top, r: q.right, b: q.bottom });
  };
  const shown = (e: Element) => {
    const st = getComputedStyle(e);
    return st.visibility !== "hidden" && st.display !== "none" && +st.opacity > 0.1;
  };
  scope.querySelectorAll(CONTROLS).forEach((c) => {
    if (!skip.contains(c) && shown(c)) for (const q of c.getClientRects()) add(q);
  });
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const seen = new Map<Element, boolean>();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const parent = n.parentElement;
    if (!parent || !n.textContent?.trim() || skip.contains(parent)) continue;
    let ok = seen.get(parent);
    if (ok === undefined) seen.set(parent, (ok = shown(parent)));
    if (!ok) continue;
    range.selectNodeContents(n);
    for (const q of range.getClientRects()) add(q);
  }
  return out;
}

// SVG y (of 160) that rests on the spot, per pose: feet or seat.
const REST: Record<Pose, number> = { stand: 154, sit: 123 };

/** The floor of the bowl of the first "C" in the footer wordmark. */
function insideTheC(_: DOMRect, el: Element): Pt | null {
  const text = el.querySelector("text");
  if (!text) return null;
  const box = text.getExtentOfChar(0);
  const m = text.getScreenCTM();
  if (!m) return null;
  const em = 200 * m.a;
  const baseline = 200 * m.d + m.f;
  return { x: (box.x + box.width * 0.5) * m.a + m.e, y: baseline - em * 0.14 };
}

const STATIONS: Station[] = [
  { key: "hero", anchor: ".hero-picker", spot: (r) => ({ x: r.left + r.width * 0.62, y: r.top + 1 }), pose: "sit", greet: "wave" },
  { key: "statement", anchor: '[aria-labelledby="statement-title"] .border-t', spot: (r) => ({ x: r.right - 110, y: r.top + 1 }), pose: "sit", greet: "wave" },
  { key: "coverage", anchor: "#coverage .sticky", scopeAnchor: true, spot: (r) => ({ x: r.right - 50, y: r.bottom }), pose: "stand", greet: "salute" },
  { key: "bundle", anchor: "[data-roofie-house]", spot: (r) => ({ x: r.right + 60, y: r.bottom - 1 }), pose: "stand", greet: "salute" },
  {
    key: "process",
    anchor: ".process-bar",
    spot: (r) => {
      const track = document.querySelector(".process-bar")?.parentElement?.getBoundingClientRect() ?? r;
      return { x: Math.max(track.left + 40, r.right), y: track.top };
    },
    pose: "stand",
  },
  {
    key: "moments",
    anchor: 'ul[aria-label="Life moments"] > li:nth-child(2)',
    surface: 'ul[aria-label="Life moments"] > li',
    spot: (r) => ({ x: r.left + r.width * 0.72, y: r.top + 1 }),
    pose: "sit",
    greet: "wave",
  },
  {
    key: "why",
    anchor: '[aria-labelledby="why-title"] .grid > div',
    surface: '[aria-labelledby="why-title"] .grid > div',
    spot: (r) => ({ x: r.right - 60, y: r.top + 1 }),
    pose: "sit",
    greet: "wave",
  },
  { key: "compare", anchor: '[aria-labelledby="compare-title"] [role="radiogroup"]', spot: (r) => ({ x: r.right + 60, y: r.bottom }), pose: "stand", greet: "salute" },
  { key: "faq", anchor: '[aria-labelledby="faq-title"] a[href^="tel:"]', spot: (r) => ({ x: r.right + 60, y: r.bottom }), pose: "stand", greet: "salute" },
  {
    key: "journal",
    anchor: '[aria-labelledby="journal-title"] li',
    surface: '[aria-labelledby="journal-title"] li',
    spot: (r) => ({ x: r.right - 60, y: r.top + 1 }),
    pose: "sit",
    greet: "wave",
  },
  { key: "cta", anchor: '[aria-labelledby="cta-title"] a[href^="tel:"]', spot: (r) => ({ x: r.right + 60, y: r.bottom }), pose: "stand", greet: "salute" },
  { key: "footer", anchor: 'footer svg[aria-label="ChaCha Insurance"]', spot: insideTheC, pose: "stand", nap: true },
];

const easeInOut = gsap.parseEase("power2.inOut");

/**
 * The ChaCha uncle: a well-dressed gentleman with round glasses and a grand mustache.
 * On wide screens he strolls to each section and sits or stands somewhere fitting,
 * then stays put on that spot while you scroll. In the footer he curls up in the "C" for a nap.
 * He never covers text or buttons: if his spot would, he slides along the surface to a clear place.
 * On phones he only shows up where there's a clear spot, and otherwise stays tucked away below the screen.
 */
export default function Mascot() {
  const [on, setOn] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [held, setHeld] = useState<string | null>(null);
  const [station, setStation] = useState("");
  const [leftSide, setLeftSide] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const scaler = useRef<HTMLDivElement>(null);
  const flip = useRef<SVGGElement>(null);
  const body = useRef<SVGGElement>(null);
  const eyes = useRef<SVGGElement>(null);
  const armL = useRef<SVGGElement>(null);
  const armR = useRef<SVGGElement>(null);
  const legL = useRef<SVGGElement>(null);
  const legR = useRef<SVGGElement>(null);
  const thighL = useRef<SVGPathElement>(null);
  const thighR = useRef<SVGPathElement>(null);
  const shinL = useRef<SVGGElement>(null);
  const shinR = useRef<SVGGElement>(null);
  const knees = useRef<SVGGElement>(null);
  const umbrella = useRef<SVGGElement>(null);
  const clipboard = useRef<SVGGElement>(null);
  const chute = useRef<SVGGElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const confetti = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [badgeIcon, setBadgeIcon] = useState<string | null>(null);
  const [line, setLine] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(STORE) === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hidden && !reduce) setOn(true);
  }, []);

  useEffect(() => {
    if (!on) return;
    const el = root.current!;
    const top = { transformOrigin: "50% 0%" };
    gsap.set([legL.current, legR.current, thighL.current, thighR.current, shinL.current, shinR.current], top);
    gsap.set(armL.current, { svgOrigin: "39 90" });
    gsap.set(armR.current, { svgOrigin: "81 90" });
    gsap.set(flip.current, { svgOrigin: "60 100" });
    const arms = [armL.current, armR.current];
    const legs = [legL.current, legR.current];

    let holding = false; // holding the clipboard while the quote form is open
    let formOpen = false;

    // ---- gestures ----
    const restL = () => (holding ? -38 : pose === "sit" ? 14 : 0);
    const restR = () => (holding ? 38 : pose === "sit" ? -14 : 0);
    const restArms = (d = 0.3) => {
      gsap.to(armL.current, { rotation: restL(), duration: d, ease: "power2.inOut" });
      gsap.to(armR.current, { rotation: restR(), duration: d, ease: "power2.inOut" });
    };
    const once = (build: (tl: gsap.core.Timeline) => void) => {
      if (busy.current) return;
      busy.current = true;
      const tl = gsap.timeline({
        onComplete: () => {
          busy.current = false;
          restArms(0.25);
        },
      });
      build(tl);
    };
    const wave = () =>
      once((tl) =>
        tl
          .to(armR.current, { rotation: -150, duration: 0.28, ease: "power2.out" })
          .to(armR.current, { rotation: -122, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" })
          .to(armR.current, { rotation: pose === "sit" ? -14 : 0, duration: 0.35, ease: "power2.inOut" }),
      );
    const salute = () =>
      once((tl) =>
        tl
          .to(armR.current, { rotation: -168, duration: 0.28, ease: "power2.out" })
          .to(body.current, { rotation: -3, svgOrigin: "60 120", duration: 0.22 }, 0.05)
          .to(armR.current, { rotation: -152, duration: 0.2, yoyo: true, repeat: 1 }, 0.5)
          .to(body.current, { rotation: 0, duration: 0.3 }, 0.9)
          .to(armR.current, { rotation: 0, duration: 0.32, ease: "power2.inOut" }, 0.95),
      );
    const cheer = () =>
      once((tl) =>
        tl
          .to(body.current, { scaleY: 0.94, svgOrigin: "60 120", duration: 0.12, ease: "power2.out" })
          .to(armL.current, { rotation: 140, duration: 0.18 }, 0.1)
          .to(armR.current, { rotation: -140, duration: 0.18 }, 0.1)
          .to(body.current, { scaleY: 1.04, duration: 0.14 }, 0.12)
          .to(flip.current, { y: -14, duration: 0.22, ease: "power2.out" }, 0.12)
          .to(flip.current, { y: 0, duration: 0.2, ease: "power2.in" })
          .to(body.current, { scaleY: 0.95, duration: 0.08 })
          .to(body.current, { scaleY: 1, duration: 0.35, ease: "elastic.out(1, 0.5)" }),
      );

    // ---- props ----
    const showBadge = (slug: string, hold = 1.6) => {
      setBadgeIcon(slug);
      const b = badge.current!;
      gsap.killTweensOf(b);
      gsap.fromTo(b, { opacity: 0, scale: 0.3, x: 0, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(2.4)" });
      if (hold > 0) gsap.to(b, { opacity: 0, scale: 0.6, duration: 0.3, delay: hold });
    };
    const showProp = (el: SVGGElement | null, secs: number) => {
      gsap.killTweensOf(el);
      gsap.fromTo(el, { opacity: 0, scale: 0.6, svgOrigin: "88 112" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" });
      gsap.to(el, { opacity: 0, scale: 0.8, duration: 0.3, delay: secs });
    };
    const burst = () => {
      const pieces = Array.from(confetti.current!.children) as HTMLElement[];
      pieces.forEach((c, i) => {
        const ang = (i / pieces.length) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 50 + Math.random() * 60;
        gsap.fromTo(
          c,
          { x: 0, y: 0, opacity: 1, rotation: 0, scale: 1 },
          {
            keyframes: [
              { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 40, rotation: Math.random() * 360, duration: 0.5, ease: "power2.out" },
              { y: `+=${70 + Math.random() * 40}`, opacity: 0, rotation: "+=180", duration: 0.9, ease: "power1.in" },
            ],
          },
        );
      });
    };

    // The cha-cha: step, step, cha-cha-cha, and a little spin.
    const chacha = () =>
      once((tl) => {
        const d = 0.2;
        tl.to(armL.current, { rotation: 60, duration: d }, 0)
          .to(armR.current, { rotation: -60, duration: d }, 0)
          .to(flip.current, { x: -6, duration: d })
          .to(legL.current, { rotation: 20, duration: d, yoyo: true, repeat: 1 }, "<")
          .to(flip.current, { x: 6, duration: d * 2 })
          .to(legR.current, { rotation: -20, duration: d, yoyo: true, repeat: 1 }, "<");
        [-1, 1, -1].forEach((k) => {
          tl.to(flip.current, { x: k * 3, y: -3, duration: d / 2 }).to(flip.current, { y: 0, duration: d / 2 });
        });
        tl.to(flip.current, { scaleX: -facing, duration: 0.18 })
          .to(flip.current, { scaleX: facing, duration: 0.18 })
          .to(flip.current, { x: 0, duration: 0.2 });
      });

    // Eyes: when something is happening on the page he looks at it instead of the cursor for a moment.
    let eyesHeld = 0;
    const lookAt = (x: number, y: number, secs: number) => {
      eyesHeld = performance.now() + secs * 1000;
      gsap.killTweensOf(eyes.current, "x,y");
      gsap.to(eyes.current, { x: x * facing, y, duration: 0.35, ease: "power2.out" });
    };

    // A small speech bubble ("?", "Good call") that floats up and fades.
    const say = (text: string) => setLine({ text, id: Date.now() });

    // When a cover is picked in the hero, he watches its little scene on the letters
    // and responds in a quiet, fitting way. Nothing pops out at the visitor.
    const react = (slug: string) => {
      if (busy.current) {
        gsap.killTweensOf([armL.current, armR.current, flip.current, body.current, shinL.current, shinR.current]);
        gsap.set(flip.current, { rotation: 0, x: 0, y: 0 });
        gsap.set(body.current, { rotation: 0, scaleY: 1 });
        busy.current = false;
      }
      const rest = pose === "sit" ? -14 : 0;
      const nod = (tl: gsap.core.Timeline, at: number | string) =>
        tl.to(body.current, { rotation: 3, svgOrigin: "60 120", duration: 0.18, yoyo: true, repeat: 1, ease: "sine.inOut" }, at);
      // the scenes play on the words, up and to his left
      lookAt(-1.6, -1.1, 3.2);
      switch (slug) {
        case "auto-insurance":
          // follows the car along the letters with his eyes, then a nod as it parks
          gsap.fromTo(eyes.current, { x: -1.8 * facing }, { x: 1.6 * facing, duration: 2.4, ease: "none", delay: 1.0 });
          return once((tl) => nod(tl, 3.4));
        case "boat-insurance":
          // shades his eyes like a sailor watching a boat go by
          return once((tl) =>
            tl.to(armR.current, { rotation: -150, duration: 0.35, ease: "power2.out" }, 0.4)
              .to(flip.current, { rotation: -2, duration: 0.8, yoyo: true, repeat: 2, ease: "sine.inOut" }, 0.6)
              .to(armR.current, { rotation: rest, duration: 0.4 }, 3.2),
          );
        case "homeowners-insurance":
        case "condo-insurance":
          // looks up at the building going up, then an approving nod
          lookAt(-1.2, -2, 2.6);
          return once((tl) => nod(tl, 1.8));
        case "renters-insurance":
          // settles back, relaxed, like the couch in the scene
          return once((tl) =>
            tl.to(body.current, { rotation: -4, svgOrigin: "60 120", duration: 0.5, ease: "sine.inOut" }, 0.6)
              .to(armL.current, { rotation: 40, duration: 0.4 }, 0.6)
              .to(body.current, { rotation: 0, duration: 0.5 }, 3.4)
              .to(armL.current, { rotation: pose === "sit" ? 14 : 0, duration: 0.4 }, 3.4),
          );
        case "flood-insurance":
          // lifts his feet as the water rises, and lowers them as it drains
          return once((tl) =>
            tl.to([shinL.current, shinR.current], { rotation: pose === "sit" ? -55 : 0, y: pose === "sit" ? -16 : -3, duration: 0.6, ease: "power2.out" }, 0.5)
              .to([shinL.current, shinR.current], { rotation: 0, y: pose === "sit" ? -12.5 : 0, duration: 0.6, ease: "power2.inOut" }, 3.4),
          );
        case "umbrella-insurance":
          // it rains on the letters, so up goes his umbrella too
          showProp(umbrella.current, 3.2);
          return once((tl) => tl.to(armR.current, { rotation: -20, duration: 0.25 }, 0.3).to(armR.current, { rotation: rest, duration: 0.3 }, 3.6));
        case "pet-insurance":
          // a small wave to the dog peeking over the words
          return once((tl) =>
            tl.to(armR.current, { rotation: -130, duration: 0.3, ease: "power2.out" }, 1.0)
              .to(armR.current, { rotation: -112, duration: 0.2, yoyo: true, repeat: 3, ease: "sine.inOut" })
              .to(armR.current, { rotation: rest, duration: 0.35 }),
          );
        case "life-insurance":
          // hand on heart
          return once((tl) =>
            tl.to(armR.current, { rotation: -115, duration: 0.4, ease: "power2.out" }, 0.4).to(armR.current, { rotation: rest, duration: 0.4 }, 3.2),
          );
        case "health-insurance":
          // checks his pulse along with the heartbeat line
          return once((tl) =>
            tl.to(armR.current, { rotation: -60, duration: 0.35 }, 0.5)
              .to(armL.current, { rotation: -40, duration: 0.35 }, 0.5)
              .add(() => void 0, 1.0)
              .to([armL.current, armR.current], { rotation: pose === "sit" ? 0 : 0, duration: 0.35 }, 3.4)
              .add(() => {
                gsap.to(armL.current, { rotation: pose === "sit" ? 14 : 0, duration: 0.2 });
                gsap.to(armR.current, { rotation: rest, duration: 0.2 });
              }),
          );
        case "business-insurance":
          // the shop sign flips to Open: a polite little clap
          return once((tl) =>
            tl.to(armL.current, { rotation: -35, duration: 0.25 }, 2.3)
              .to(armR.current, { rotation: 35, duration: 0.25 }, 2.3)
              .to(armL.current, { rotation: -25, duration: 0.09, yoyo: true, repeat: 5 }, 2.6)
              .to(armR.current, { rotation: 25, duration: 0.09, yoyo: true, repeat: 5 }, 2.6)
              .to(armL.current, { rotation: pose === "sit" ? 14 : 0, duration: 0.3 }, 3.4)
              .to(armR.current, { rotation: rest, duration: 0.3 }, 3.4),
          );
        case "bundle":
          return once((tl) =>
            tl.to(armL.current, { rotation: -35, duration: 0.25 }, 1.2)
              .to(armR.current, { rotation: 35, duration: 0.25 }, 1.2)
              .to(armL.current, { rotation: -25, duration: 0.09, yoyo: true, repeat: 5 }, 1.5)
              .to(armR.current, { rotation: 25, duration: 0.09, yoyo: true, repeat: 5 }, 1.5)
              .to(armL.current, { rotation: pose === "sit" ? 14 : 0, duration: 0.3 }, 2.4)
              .to(armR.current, { rotation: rest, duration: 0.3 }, 2.4),
          );
        default:
          return once((tl) => nod(tl, 0.6));
      }
    };

    // FAQ: a question opens, he has a think.
    const think = () =>
      once((tl) => {
        say("?");
        lookAt(-1.4, -1.6, 1.6);
        tl.to(armR.current, { rotation: -160, duration: 0.3, ease: "power2.out" })
          .to(armR.current, { rotation: -150, duration: 0.1, yoyo: true, repeat: 5 })
          .to(armR.current, { rotation: 0, duration: 0.3 });
      });

    // Compare: the table lands on ChaCha, he approves.
    const approve = () =>
      once((tl) => {
        say("Good call");
        tl.to(armR.current, { rotation: -125, duration: 0.3, ease: "back.out(2)" })
          .to(body.current, { rotation: 3, svgOrigin: "60 120", duration: 0.18, yoyo: true, repeat: 1 }, "<0.1")
          .to(armR.current, { rotation: 0, duration: 0.35 }, "+=0.6");
      });

    // Hover: a proud mustache twirl.
    const twirl = () =>
      once((tl) =>
        tl.to(armR.current, { rotation: -148, duration: 0.3, ease: "power2.out" })
          .to(armR.current, { rotation: -140, duration: 0.12, yoyo: true, repeat: 3 })
          .to(eyes.current, { scaleY: 0.3, svgOrigin: "60 55", duration: 0.15 }, "<")
          .to(eyes.current, { scaleY: 1, duration: 0.15 })
          .to(armR.current, { rotation: pose === "sit" ? -14 : 0, duration: 0.3 }, "<"),
      );

    // Under one roof: he lifts the new cover up and hands it to the house, then dusts off.
    const carry = (slug: string) => {
      if (busy.current || travel) return;
      showBadge(slug, 0);
      const house = document.querySelector("[data-roofie-house]")?.getBoundingClientRect();
      const b = badge.current!;
      busy.current = true;
      const tl = gsap.timeline({
        onComplete: () => {
          busy.current = false;
          restArms(0.25);
        },
      });
      tl.to(armL.current, { rotation: 160, duration: 0.25 }, 0).to(armR.current, { rotation: -160, duration: 0.25 }, 0);
      if (house) {
        const br = b.getBoundingClientRect();
        tl.to(b, {
          x: house.left + house.width / 2 - (br.left + br.width / 2),
          y: house.top + house.height * 0.45 - (br.top + br.height / 2),
          scale: 0.5,
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
        }, 0.45);
      }
      tl.to([armL.current, armR.current], { rotation: 0, duration: 0.25 }, 1.0)
        .to(armL.current, { rotation: -25, duration: 0.08, yoyo: true, repeat: 3 }, 1.25)
        .to(armR.current, { rotation: 25, duration: 0.08, yoyo: true, repeat: 3 }, 1.25);
    };

    // ---- poses ----
    let pose: Pose = "stand";
    let poseTl: gsap.core.Timeline | null = null;
    const look = { rest: REST.stand / 160 };
    const applyPose = (p: Pose) => {
      gsap.to(look, { rest: REST[p] / 160, duration: 0.45, ease: "power2.inOut" });
      if (p === pose) return;
      pose = p;
      el.dataset.pose = p;
      poseTl?.kill();
      if (p === "stand") {
        gsap.to(flip.current, { rotation: 0, y: 0, duration: 0.4, ease: "power2.out" });
        gsap.to([...arms, ...legs, shinL.current, shinR.current], { rotation: 0, x: 0, y: 0, duration: 0.3 });
        gsap.to([thighL.current, thighR.current], { scaleY: 1, duration: 0.3 });
        gsap.to(knees.current, { opacity: 0, duration: 0.2 });
        return;
      }
      // sit: knees come forward (thighs foreshorten), shins drop over the edge and swing
      gsap.to(knees.current, { opacity: 1, duration: 0.3, delay: 0.1 });
      gsap.to(flip.current, { rotation: 0, y: 0, duration: 0.3 });
      gsap.to([thighL.current, thighR.current], { scaleY: 0.18, duration: 0.35, ease: "power2.out" });
      gsap.to(shinL.current, { y: -12.5, x: -2, duration: 0.35, ease: "power2.out" });
      gsap.to(shinR.current, { y: -12.5, x: 2, duration: 0.35, ease: "power2.out" });
      gsap.to(legL.current, { x: -2, rotation: 0, duration: 0.3 });
      gsap.to(legR.current, { x: 2, rotation: 0, duration: 0.3 });
      gsap.to(armL.current, { rotation: 14, duration: 0.3 });
      gsap.to(armR.current, { rotation: -14, duration: 0.3 });
      poseTl = gsap
        .timeline({ repeat: -1, yoyo: true, delay: 0.5, defaults: { ease: "sine.inOut", duration: 0.85 } })
        .fromTo(shinL.current, { rotation: -12 }, { rotation: 12 }, 0)
        .fromTo(shinR.current, { rotation: 12 }, { rotation: -12 }, 0);
    };

    // ---- walking ----
    const walk = gsap
      .timeline({ repeat: -1, paused: true, defaults: { ease: "sine.inOut" } })
      .to(legL.current, { rotation: 18, duration: 0.18 })
      .to(legR.current, { rotation: -18, duration: 0.18 }, 0)
      .to(shinR.current, { rotation: 14, duration: 0.18 }, 0)
      .to(body.current, { y: -2, duration: 0.18 }, 0)
      .to(legL.current, { rotation: -18, duration: 0.36 })
      .to(legR.current, { rotation: 18, duration: 0.36 }, "<")
      .to(shinR.current, { rotation: 0, duration: 0.18 }, "<")
      .to(shinL.current, { rotation: 14, duration: 0.18 }, "<0.18")
      .to(body.current, { y: 0, duration: 0.18 }, "<-0.18")
      .to(body.current, { y: -2, duration: 0.18 }, ">")
      .to(legs, { rotation: 0, duration: 0.18 })
      .to(shinL.current, { rotation: 0, duration: 0.18 }, "<")
      .to(body.current, { y: 0, duration: 0.18 }, "<")
      .to(armL.current, { rotation: -16, duration: 0.36, yoyo: true, repeat: 1 }, 0)
      .to(armR.current, { rotation: 16, duration: 0.36, yoyo: true, repeat: 1 }, 0);
    const stopWalk = () => {
      if (walk.paused()) return;
      walk.pause();
      gsap.to([...legs, ...arms, shinL.current, shinR.current], { rotation: 0, duration: 0.2 });
      gsap.to(body.current, { y: 0, duration: 0.2 });
    };

    // ---- where he goes ----
    const wide = window.matchMedia("(min-width: 1024px)");
    const size = () => ({ w: el.offsetWidth, h: el.offsetHeight });
    const corner = () => {
      const { w, h } = size();
      const m = wide.matches ? 24 : 12;
      return { x: window.innerWidth - w / 2 - m, y: window.innerHeight - m - h * (1 - look.rest) };
    };
    // on phones there is no free corner, so when no spot is clear he waits just below the screen
    const away = () => (wide.matches ? corner() : { x: window.innerWidth - size().w / 2 - 12, y: window.innerHeight + size().h + 24 });

    // Obstacles are kept relative to the anchor so they stay right while the page scrolls,
    // and refreshed a few times a second for anything that moves on its own.
    let obs: { key: string; at: number; list: Box[] } = { key: "", at: 0, list: [] };
    const blockers = (s: Station, a: Element, ar: DOMRect) => {
      const now = performance.now();
      if (obs.key !== s.key || now - obs.at > 300) {
        const scope = s.scopeAnchor ? a : (a.closest("section, footer") ?? a);
        const list = obstacles(scope, el).map((b) => ({ l: b.l - ar.left, t: b.t - ar.top, r: b.r - ar.left, b: b.b - ar.top }));
        obs = { key: s.key, at: now, list };
      }
      return obs.list;
    };
    // his visible silhouette above the spot (legs hanging over the edge are fine when sitting)
    const silhouette = (x: number, y: number, p: Pose): Box => {
      const { w, h } = size();
      return { l: x - w * 0.34, r: x + w * 0.34, t: y - h * ((REST[p] - 24) / 160), b: y - 3 };
    };
    const fits = (b: Box) => b.t >= 76 && b.b <= window.innerHeight - 8 && b.l >= 4 && b.r <= window.innerWidth - 4;
    const clearOf = (b: Box, list: Box[], ar: DOMRect) => {
      const pad = 6;
      for (const o of list) {
        // no margin under him: the surface he sits or stands on is allowed to touch
        if (b.l - pad < o.r + ar.left && b.r + pad > o.l + ar.left && b.t - pad < o.b + ar.top && b.b > o.t + ar.top) return false;
      }
      return true;
    };
    /** the nearest spot to the preferred one that covers nothing */
    const clearSpot = (s: Station, a: Element, ar: DOMRect, p: Pt): Pt | null => {
      const list = blockers(s, a, ar);
      const ok = (x: number, y: number) => {
        const b = silhouette(x, y, s.pose);
        return fits(b) && clearOf(b, list, ar);
      };
      if (ok(p.x, p.y)) return p;
      const { w } = size();
      let best: (Pt & { d: number }) | null = null;
      if (s.pose === "sit") {
        // slide along the top edge of the anchor or its sibling surfaces
        const surfaces = s.surface ? [...document.querySelectorAll(s.surface)] : [a];
        for (const e of surfaces) {
          const r = e.getBoundingClientRect();
          const y = r.top + 1;
          for (let x = r.left + w * 0.3; x <= r.right - w * 0.3; x += 6) {
            const d = Math.abs(x - p.x) + Math.abs(y - p.y) * 2;
            if ((!best || d < best.d) && ok(x, y)) best = { x, y, d };
          }
        }
      } else {
        for (let dx = 6; dx <= 360 && !best; dx += 6) {
          for (const x of [p.x + dx, p.x - dx]) if (!best && ok(x, p.y)) best = { x, y: p.y, d: dx };
        }
      }
      return best && { x: best.x, y: best.y };
    };

    type Target = { st?: Station; spot: Pt; corner: boolean };
    const pick = (): Target => {
      const vh = window.innerHeight;
      for (const s of STATIONS) {
        const a = document.querySelector(s.anchor);
        if (!a) continue;
        const sec = (a.closest("section, footer") ?? a) as HTMLElement;
        const sr = sec.getBoundingClientRect();
        if (!(sr.top <= vh * 0.55 && sr.bottom >= vh * 0.45)) continue;
        const ar = a.getBoundingClientRect();
        const p0 = s.spot(ar, a);
        if (!p0) break;
        const p = s.nap ? (fits(silhouette(p0.x, p0.y, "stand")) ? p0 : null) : clearSpot(s, a, ar, p0);
        if (!p) return { st: s, spot: away(), corner: true };
        return { st: s, spot: p, corner: false };
      }
      return { spot: away(), corner: true };
    };

    // ---- moving: a gentle stroll along an arc, then glued to the spot ----
    const pos = { x: 0, y: 0 };
    const place = (spot: Pt) => {
      const { w, h } = size();
      pos.x = spot.x;
      pos.y = spot.y;
      gsap.set(el, { x: spot.x - w / 2, y: spot.y - h * look.rest });
    };
    place(away());

    const fig = scaler.current!;
    gsap.set(fig, { transformOrigin: "50% 100%" });
    let key = "";
    let travel: { from: Pt; p: number; dur: number; arc: number; para?: boolean } | null = null;
    let landed = false;
    try {
      landed = sessionStorage.getItem("roofie-landed") === "1";
    } catch {}
    let settle = 0;
    let arrived = false;
    let facing = 1;
    let napping = false;
    const greeted = new Set<string>();
    let lastSpotX = NaN;
    let speed = 0; // smoothed px per second along the ground
    let lean = 0;

    const wake = () => {
      if (!napping) return;
      napping = false;
      nap(false);
      fig.style.pointerEvents = "";
      gsap.to(fig, { opacity: 1, y: 0, scaleY: 1, duration: 0.45, ease: "back.out(2)" });
    };

    const tick = (_t: number, deltaMs: number) => {
      const t = pick();
      const k = t.corner ? `corner:${t.st?.key ?? ""}` : t.st!.key;
      if (k !== key) {
        key = k;
        arrived = false;
        settle = 0;
        setStation(t.st?.key ?? "");
        wake();
        if (lean !== 0) {
          lean = 0;
          gsap.to(body.current, { rotation: 0, duration: 0.25 });
        }
        if (holding) setClipboard(false);
        applyPose("stand");
        const dist = Math.hypot(t.spot.x - pos.x, t.spot.y - pos.y);
        travel = dist > 6 ? { from: { ...pos }, p: 0, dur: gsap.utils.clamp(0.8, 1.8, dist / 600), arc: Math.min(90, dist * 0.18) } : null;
        if (!landed && wide.matches) {
          // First visit: he floats down on a parachute shaped like the logo's roof.
          landed = true;
          try {
            sessionStorage.setItem("roofie-landed", "1");
          } catch {}
          const dur = 2.6;
          travel = { from: { x: t.spot.x + 60, y: -40 }, p: -(INTRO_DELAY + 0.3) / dur, dur, arc: 0, para: true };
          gsap.set(chute.current, { opacity: 1, scale: 1 });
          gsap.set(armL.current, { rotation: 150 });
          gsap.set(armR.current, { rotation: -150 });
        }
      }

      if (travel?.para) {
        travel.p = Math.min(1, travel.p + deltaMs / 1000 / travel.dur);
        const q = Math.max(0, travel.p);
        const e = 1 - Math.pow(1 - q, 2);
        const sway = Math.sin(q * Math.PI * 3) * (1 - q);
        place({ x: travel.from.x + (t.spot.x - travel.from.x) * e + sway * 22, y: travel.from.y + (t.spot.y - travel.from.y) * e });
        gsap.set(flip.current, { rotation: sway * 7 });
        if (travel.p >= 1) {
          travel = null;
          gsap.set(flip.current, { rotation: 0 });
          gsap.to(chute.current, { scaleY: 0, opacity: 0, svgOrigin: "60 40", duration: 0.45, ease: "power2.in" });
          gsap.to([armL.current, armR.current], { rotation: 0, duration: 0.4, delay: 0.1 });
          gsap.fromTo(flip.current, { y: 0 }, { keyframes: [{ y: 4, duration: 0.1 }, { y: 0, duration: 0.3, ease: "back.out(3)" }] });
        }
      } else if (travel) {
        travel.p = Math.min(1, travel.p + deltaMs / 1000 / travel.dur);
        const e = easeInOut(travel.p);
        const x = travel.from.x + (t.spot.x - travel.from.x) * e;
        const y = travel.from.y + (t.spot.y - travel.from.y) * e - travel.arc * Math.sin(Math.PI * travel.p);
        const d = t.spot.x >= travel.from.x ? 1 : -1;
        if (d !== facing) {
          facing = d;
          gsap.to(flip.current, { scaleX: d, duration: 0.25 });
        }
        if (walk.paused() && !busy.current) walk.play();
        walk.timeScale(1 + Math.sin(Math.PI * travel.p) * 0.8);
        place({ x, y });
        if (travel.p >= 1) {
          travel = null;
          stopWalk();
        }
      } else {
        // On the progress line his spot slides with the scroll: walk or run to keep up.
        const dx = Number.isNaN(lastSpotX) ? 0 : t.spot.x - lastSpotX;
        const v = Math.abs(dx) / Math.max(1, deltaMs) * 1000;
        speed += (v - speed) * 0.2;
        if (t.st?.key === "process" && speed > 12) {
          const d = dx > 0 ? 1 : dx < 0 ? -1 : facing;
          if (d !== facing) {
            facing = d;
            gsap.to(flip.current, { scaleX: d, duration: 0.2 });
          }
          // ~1 step cycle per 90px travelled; running past ~450px/s
          walk.timeScale(gsap.utils.clamp(0.6, 3.2, speed / 110));
          if (walk.paused() && !busy.current) walk.play();
          const target = gsap.utils.clamp(0, 9, (speed - 220) / 40);
          lean += (target - lean) * 0.15;
          gsap.set(body.current, { rotation: lean * facing, svgOrigin: "60 120" });
        } else if (t.st?.key === "process") {
          if (!walk.paused()) stopWalk();
          if (lean > 0.05) {
            lean *= 0.85;
            gsap.set(body.current, { rotation: lean * facing, svgOrigin: "60 120" });
          }
        }
        place(t.spot);
        if (!arrived && t.st && !t.corner && (settle += deltaMs) > 250) {
          arrived = true;
          if (t.st.nap) {
            // settle down into the "C": he sinks out of view and the sleeping drawing takes over
            napping = true;
            fig.style.pointerEvents = "none";
            wave();
            gsap.to(fig, { opacity: 0, y: 8, scaleY: 0.85, duration: 0.35, delay: 1.4, ease: "power2.in", onComplete: () => nap(true) });
            return;
          }
          applyPose(t.st.pose);
          // a soft settle as he lands on the spot
          gsap.fromTo(body.current, { scaleY: 0.97 }, { scaleY: 1, svgOrigin: "60 120", duration: 0.4, ease: "elastic.out(1, 0.6)" });
          if (t.st.key === "cta" && formOpen) setClipboard(true);
          // greet a spot only the first time he visits it on this page view
          const g = greeted.has(t.st.key) ? undefined : t.st.greet;
          greeted.add(t.st.key);
          if (g) window.setTimeout(() => (g === "wave" ? wave() : salute()), t.st.pose === "sit" ? 550 : 200);
        }
      }
      lastSpotX = travel ? NaN : t.spot.x;
      setLeftSide(pos.x < window.innerWidth / 2);
    };
    gsap.ticker.add(tick);

    // his chest rises and falls a touch
    const breathe = gsap.to(body.current?.querySelector("path[d^='M38 89']") ?? null, {
      scaleY: 1.02,
      scaleX: 1.01,
      svgOrigin: "60 125",
      duration: 1.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    // ---- eyes follow the cursor, and he blinks ----
    const ex = gsap.quickTo(eyes.current, "x", { duration: 0.35 });
    const ey = gsap.quickTo(eyes.current, "y", { duration: 0.35 });
    const onPointer = (e: PointerEvent) => {
      poke();
      if (performance.now() < eyesHeld) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.35);
      const len = Math.hypot(dx, dy) || 1;
      ex((dx / len) * 1.6 * facing);
      ey((dy / len) * 1.2);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    let blinkT = 0;
    const blink = () => {
      gsap.to(eyes.current, { scaleY: 0.1, svgOrigin: "60 55", duration: 0.07, yoyo: true, repeat: 1 });
      blinkT = window.setTimeout(blink, 2800 + Math.random() * 3200);
    };
    blinkT = window.setTimeout(blink, 2000);

    const onCheer = (e: Event) => {
      const slug = (e as CustomEvent<string | undefined>).detail;
      if (pose !== "stand" || travel) return;
      if (slug && key === "bundle") carry(slug);
      else cheer();
    };

    // Left alone for a while, he dances.
    let lastActive = performance.now();
    let idleWait = 14000;
    const poke = () => void (lastActive = performance.now());
    window.addEventListener("scroll", poke, { passive: true });
    const idleT = window.setInterval(() => {
      if (performance.now() - lastActive < idleWait || travel || napping || busy.current || !arrived || holding) return;
      lastActive = performance.now();
      idleWait = 60000; // after the first dance, only once a minute at most
      chacha();
    }, 1000);
    const onCover = (e: Event) => setHeld((e as CustomEvent<string>).detail);
    const onPick = (e: Event) => {
      if (key === "hero" && arrived) react((e as CustomEvent<string>).detail);
    };
    const onForm = (e: Event) => {
      const what = (e as CustomEvent<string>).detail;
      formOpen = what === "open";
      setClipboard(formOpen && key === "cta");
      if (what === "sent") {
        burst();
        window.setTimeout(chacha, 250);
      }
    };
    // both hands come in to hold the board (only while he's by the quote form)
    function setClipboard(on: boolean) {
      if (on === holding) return;
      holding = on;
      gsap.to(clipboard.current, { opacity: on ? 1 : 0, duration: on ? 0.3 : 0.2 });
      if (!busy.current) restArms(0.35);
    }

    const onThink = () => {
      if (key === "faq" && arrived && !travel) think();
    };
    const onApprove = () => {
      if (key === "compare" && arrived && !travel) approve();
    };
    let lookUntil = 0;
    const onLook = (e: Event) => {
      if (key !== "moments") return;
      const now = performance.now();
      if (now < lookUntil) return;
      lookUntil = now + 120;
      lookAt((e as CustomEvent<string>).detail === "right" ? 1.8 : -1.8, 0.8, 0.9);
    };
    const onEnter = () => {
      if (!travel && !holding) twirl();
    };
    window.addEventListener("roofie:think", onThink);
    window.addEventListener("roofie:approve", onApprove);
    window.addEventListener("roofie:look", onLook);

    window.addEventListener("roofie:pick", onPick);
    window.addEventListener("roofie:form", onForm);
    window.addEventListener("roofie:cheer", onCheer);
    window.addEventListener("roofie:cover", onCover);

    // ---- click: offer help ----
    const btn = el.querySelector("[data-roofie]")!;
    const onClick = () => {
      setBubble(true);
      if (pose === "sit") return wave();
      once((tl) =>
        tl
          .to(flip.current, { x: -5, rotation: -6, duration: 0.16 })
          .to(legL.current, { rotation: 18, duration: 0.16, yoyo: true, repeat: 1 }, "<")
          .to(flip.current, { x: 5, rotation: 6, duration: 0.16 })
          .to(legR.current, { rotation: -18, duration: 0.16, yoyo: true, repeat: 1 }, "<")
          .to(flip.current, { x: 0, rotation: 0, duration: 0.16 }),
      );
    };
    btn.addEventListener("click", onClick);
    btn.addEventListener("pointerenter", onEnter);

    return () => {
      gsap.ticker.remove(tick);
      walk.kill();
      poseTl?.kill();
      nap(false);
      clearTimeout(blinkT);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("roofie:cheer", onCheer);
      window.removeEventListener("roofie:pick", onPick);
      window.removeEventListener("roofie:think", onThink);
      window.removeEventListener("roofie:approve", onApprove);
      window.removeEventListener("roofie:look", onLook);
      window.removeEventListener("roofie:form", onForm);
      clearInterval(idleT);
      window.removeEventListener("scroll", poke);
      window.removeEventListener("roofie:cover", onCover);
      btn.removeEventListener("click", onClick);
      btn.removeEventListener("pointerenter", onEnter);
      breathe.kill();
    };
  }, [on]);

  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(false), 6000);
    return () => clearTimeout(t);
  }, [bubble]);

  if (!on) return null;

  const HeldIcon = held && station === "coverage" ? coverIcons[held] : null;
  const skin = "#f3c7a0";
  const skinShade = "#e2a882";
  const navy = "#1f2a44";
  const navyShade = "#16203a";
  const navyLight = "#2c3a5c";
  const trousers = "#2b2f3a";
  const silver = "#c9cfd7";
  const silverShade = "#9aa3ae";

  return (
    <div ref={root} className="group fixed top-0 left-0 z-40" style={{ willChange: "transform" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: INTRO_DELAY + 0.6, duration: 0.6 }}>
        <div ref={scaler}>
          <AnimatePresence>
            {bubble && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={`absolute bottom-full mb-2 w-max rounded-2xl bg-white px-4 py-3 text-sm shadow-[0_18px_40px_-20px_rgb(10_34_41/0.5)] ring-1 ring-ink/5 ${leftSide ? "left-0 origin-bottom-left" : "right-0 origin-bottom-right"}`}
              >
                <p className="font-semibold text-ink">Need a hand, friend?</p>
                <a href={contact.phoneHref} className="mt-0.5 block font-medium text-red underline-offset-4 hover:underline">
                  Call {contact.phone}
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            data-roofie
            aria-label="Uncle Cha, the ChaCha mascot. Tap for help."
            className="relative block h-[82px] w-[62px] rounded-2xl sm:h-[112px] sm:w-[84px]"
          >
            <svg viewBox="0 0 120 160" className="h-full w-full overflow-visible" strokeLinecap="round" strokeLinejoin="round">
              <g ref={flip}>
                {/* parachute: a canopy in the shape of the logo's roof */}
                <g ref={chute} style={{ opacity: 0 }}>
                  <path d="M40 90 L10 -6 M52 88 L38 -14 M68 88 L82 -14 M80 90 L110 -6" stroke="#9aa3ae" strokeWidth="1.3" fill="none" />
                  <path d="M4 -4 C 14 -44, 106 -44, 116 -4 Q 104 -12 92 -4 Q 80 -14 68 -6 Q 60 -14 52 -6 Q 40 -14 28 -4 Q 16 -12 4 -4 Z" fill="#d0142c" stroke="#fff" strokeWidth="2.5" paintOrder="stroke" />
                  <path d="M60 -38 L60 -6" stroke="#a10f22" strokeWidth="1.4" />
                  <path d="M60 -38 C 44 -36, 30 -24, 28 -4 M60 -38 C 76 -36, 90 -24, 92 -4" stroke="#a10f22" strokeWidth="1.4" fill="none" />
                  <rect x="56.5" y="-30" width="7" height="7" rx="1.2" fill="#fff" />
                </g>
                {/* legs: thigh, then shin and shoe hinged at the knee */}
                <g ref={legL}>
                  <path ref={thighL} d="M52 119 L51.5 136" stroke={trousers} strokeWidth="12" fill="none" />
                  <g ref={shinL}>
                    <path d="M51.5 135 L50.5 148" stroke={trousers} strokeWidth="11" fill="none" />
                    <path d="M40.5 153.5 C 40.5 147.5, 50 146.5, 54.5 149.5 L55 154 L40.5 154 Z" fill="#5a3b2b" />
                    <path d="M43.5 150 C 46 148.6, 49 148.6, 51 149.4" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
                  </g>
                </g>
                <g ref={legR}>
                  <path ref={thighR} d="M68 119 L68.5 136" stroke={trousers} strokeWidth="12" fill="none" />
                  <g ref={shinR}>
                    <path d="M68.5 135 L69.5 148" stroke={trousers} strokeWidth="11" fill="none" />
                    <path d="M79.5 153.5 C 79.5 147.5, 70 146.5, 65.5 149.5 L65 154 L79.5 154 Z" fill="#5a3b2b" />
                    <path d="M76.5 150 C 74 148.6, 71 148.6, 69 149.4" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
                  </g>
                </g>

                <g ref={body}>
                  {/* back arm */}
                  <g ref={armL}>
                    <path d="M39 90 C 35 97, 32 105, 30 113" stroke={navyShade} strokeWidth="10.5" fill="none" />
                    <path d="M28 113 L32.5 114.6" stroke="#fff" strokeWidth="4.5" />
                    <ellipse cx="29.6" cy="118.4" rx="5" ry="5.6" fill={skin} />
                  </g>

                  {/* neck */}
                  <path d="M54 74 L54 84 L66 84 L66 74 Z" fill={skinShade} />
                  {/* tailored blazer: shoulders, gentle waist, a tail at the hem */}
                  <path
                    d="M38 89 C 42 83.5, 50 82, 60 82 C 70 82, 78 83.5, 82 89 C 86 95, 87 104, 85 113 C 84 118, 81 122, 76 124 L60 125 L44 124 C 39 122, 36 118, 35 113 C 33 104, 34 95, 38 89 Z"
                    fill={navy}
                  />
                  <path d="M73 86 C 81 90, 85 100, 84.5 112" stroke={navyShade} strokeWidth="4" fill="none" opacity="0.7" />
                  <path d="M40 92 C 38 98, 37.5 104, 38 110" stroke={navyLight} strokeWidth="2.4" fill="none" opacity="0.8" />
                  {/* shirt, teal waistcoat, lapels */}
                  <path d="M50.5 84 L60 111 L69.5 84 Z" fill="#fff" />
                  <path d="M53 97 L60 113 L67 97 L60 102 Z" fill="#1b6b66" />
                  <circle cx="60" cy="106" r="1" fill="#e7d9b8" />
                  <path d="M50.5 84 L57 104 L52 101 L44.5 90 Z" fill={navyShade} />
                  <path d="M69.5 84 L63 104 L68 101 L75.5 90 Z" fill={navyShade} />
                  {/* bow tie, pocket square, button */}
                  <path d="M60 88 L51.5 83.5 L51.5 92.5 Z M60 88 L68.5 83.5 L68.5 92.5 Z" fill="#d0142c" />
                  <rect x="57.4" y="85.4" width="5.2" height="5.2" rx="1.6" fill="#a10f22" />
                  <path d="M71.5 100.5 L78 100.5 L76 96.5 L74 98.5 Z" fill="#d0142c" />
                  <circle cx="60" cy="118" r="1.5" fill="#e7d9b8" />
                  <path d="M45 124.5 L75 124.5" stroke={navyShade} strokeWidth="1.2" opacity="0.6" />

                  {/* front arm */}
                  <g ref={armR}>
                    <path d="M81 90 C 85 97, 88 105, 90 113" stroke={navy} strokeWidth="10.5" fill="none" />
                    <path d="M87.5 114.6 L92 113" stroke="#fff" strokeWidth="4.5" />
                    <ellipse cx="90.4" cy="118.4" rx="5" ry="5.6" fill={skin} />
                  </g>

                  {/* head */}
                  <circle cx="36.5" cy="57" r="5.4" fill={skinShade} />
                  <circle cx="83.5" cy="57" r="5.4" fill={skinShade} />
                  <ellipse cx="60" cy="55" rx="23" ry="24" fill={skin} />
                  <path d="M75 41 C 83 49, 83 65, 73 74" stroke={skinShade} strokeWidth="5" fill="none" opacity="0.4" />
                  {/* silver hair, swept back */}
                  <path d="M37 54 C 34 37, 46 27, 60 27 C 75 27, 87 37, 83 54 C 81 46, 77 40, 71 38.5 C 65 43, 53 43, 48 38.5 C 43 41, 39 46, 37 54 Z" fill={silver} />
                  <path d="M48 38.5 C 53 34.5, 61 33, 70 35" stroke={silverShade} strokeWidth="1.6" fill="none" />
                  <path d="M41 47 C 43 42, 46 39.5, 50 37.5" stroke={silverShade} strokeWidth="1.4" fill="none" />
                  {/* rosy cheeks */}
                  <circle cx="47" cy="64" r="4.2" fill="#ef8f86" opacity="0.32" />
                  <circle cx="73" cy="64" r="4.2" fill="#ef8f86" opacity="0.32" />
                  {/* eyes behind round glasses */}
                  <g ref={eyes}>
                    <ellipse cx="51.5" cy="54" rx="2.3" ry="2.8" fill="#1d1a20" />
                    <ellipse cx="68.5" cy="54" rx="2.3" ry="2.8" fill="#1d1a20" />
                    <circle cx="52.4" cy="53" r="0.8" fill="#fff" />
                    <circle cx="69.4" cy="53" r="0.8" fill="#fff" />
                  </g>
                  <circle cx="51.5" cy="54" r="7" fill="#fff" fillOpacity="0.14" stroke="#3a3d45" strokeWidth="1.7" />
                  <circle cx="68.5" cy="54" r="7" fill="#fff" fillOpacity="0.14" stroke="#3a3d45" strokeWidth="1.7" />
                  <path d="M58.5 53.5 Q60 52 61.5 53.5" stroke="#3a3d45" strokeWidth="1.5" fill="none" />
                  {/* brows */}
                  <path d="M45 44.5 C 48 42, 53 42, 56 44" stroke={silverShade} strokeWidth="3" fill="none" />
                  <path d="M64 44 C 67 42, 72 42, 75 44.5" stroke={silverShade} strokeWidth="3" fill="none" />
                  {/* nose */}
                  <ellipse cx="60" cy="62" rx="4.4" ry="3.7" fill={skinShade} />
                  {/* the grand mustache */}
                  <path
                    d="M60 66 C 55 64.5, 47 64.5, 41 69 C 37.5 71.5, 33.5 71, 32 67.5 C 32 74.5, 40 78.5, 48 75.5 C 53 73.8, 57 72, 60 71 C 63 72, 67 73.8, 72 75.5 C 80 78.5, 88 74.5, 88 67.5 C 86.5 71, 82.5 71.5, 79 69 C 73 64.5, 65 64.5, 60 66 Z"
                    fill={silver}
                  />
                  <path d="M60 66 C 65 64.5, 73 64.5, 79 69 C 82.5 71.5, 86.5 71, 88 67.5 C 88 74.5, 80 78.5, 72 75.5 C 67 73.8, 63 72, 60 71 Z" fill={silverShade} opacity="0.55" />
                  <path d="M44 70 C 48 68, 53 67.5, 57 68.5" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.1" fill="none" />
                  {/* smile */}
                  <path d="M55 77 Q60 80.5 65 77" stroke="#b86a55" strokeWidth="1.8" fill="none" />
                </g>

                {/* umbrella, for umbrella and flood */}
                <g ref={umbrella} style={{ opacity: 0 }}>
                  <path d="M88 14 L88 112 C 88 118, 81 118, 81 113" stroke="#fff" strokeWidth="4.5" fill="none" />
                  <path d="M88 14 L88 112 C 88 118, 81 118, 81 113" stroke="#3a3d45" strokeWidth="2.4" fill="none" />
                  <path d="M52 20 C 58 -4, 118 -4, 124 20 Q 115 13 106 20 Q 97 13 88 20 Q 79 13 70 20 Q 61 13 52 20 Z" fill="#d0142c" stroke="#fff" strokeWidth="2.5" paintOrder="stroke" />
                  <path d="M88 -1 C 80 2, 74 10, 70 20 M88 -1 C 96 2, 102 10, 106 20" stroke="#a10f22" strokeWidth="1.2" fill="none" />
                  <path d="M88 -3 L88 -8" stroke="#3a3d45" strokeWidth="2.4" />
                </g>

                {/* clipboard, while the quote form is open */}
                <g ref={clipboard} style={{ opacity: 0 }}>
                  <rect x="48" y="94" width="24" height="30" rx="2.5" fill="#8a5a3c" transform="rotate(-6 60 109)" />
                  <rect x="51" y="99" width="18" height="22" rx="1" fill="#fff" transform="rotate(-6 60 109)" />
                  <path d="M54 105 L66 104 M54 110 L66 109 M54 115 L62 114.5" stroke="#9aa3ae" strokeWidth="1.3" />
                  <rect x="55" y="92" width="10" height="5" rx="1.5" fill="#9aa3ae" transform="rotate(-6 60 109)" />
                </g>

                {/* knees, seen from the front when he sits */}
                <g ref={knees} style={{ opacity: 0 }}>
                  <ellipse cx="49.5" cy="124" rx="7.5" ry="6" fill="#343948" />
                  <ellipse cx="70.5" cy="124" rx="7.5" ry="6" fill="#343948" />
                  <path d="M45 121 Q49.5 118.5 54 121" stroke="#fff" strokeOpacity="0.12" strokeWidth="1.5" fill="none" />
                  <path d="M66 121 Q70.5 118.5 75 121" stroke="#fff" strokeOpacity="0.12" strokeWidth="1.5" fill="none" />
                </g>
              </g>
            </svg>

            {/* a cover he holds up for a moment (hero picks, under one roof) */}
            <span
              ref={badge}
              className="pointer-events-none absolute -top-9 left-1/2 -ml-4 grid size-8 place-items-center rounded-lg bg-white text-teal opacity-0 shadow-[0_8px_18px_-10px_rgb(10_34_41/0.5)] ring-1 ring-ink/10"
            >
              {badgeIcon && coverIcons[badgeIcon]
                ? (() => {
                    const I = coverIcons[badgeIcon];
                    return <I className="size-4" strokeWidth={1.9} />;
                  })()
                : null}
            </span>

            {/* a little thought or remark */}
            <AnimatePresence>
              {line && (
                <motion.span
                  key={line.id}
                  initial={{ opacity: 0, y: 6, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  onAnimationComplete={() => window.setTimeout(() => setLine((c) => (c?.id === line.id ? null : c)), 1100)}
                  className="font-display pointer-events-none absolute -top-8 -right-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-ink shadow-[0_8px_18px_-10px_rgb(10_34_41/0.45)] ring-1 ring-ink/10"
                >
                  {line.text}
                </motion.span>
              )}
            </AnimatePresence>

            {/* confetti, when a quote is sent */}
            <div ref={confetti} aria-hidden className="pointer-events-none absolute top-1/3 left-1/2">
              {Array.from({ length: 18 }, (_, i) => (
                <span
                  key={i}
                  className="absolute block h-2 w-1.5 rounded-[1px] opacity-0"
                  style={{ background: ["#d0142c", "#1b6b66", "#f5b400", "#2f9c92", "#ff8a8a"][i % 5] }}
                />
              ))}
            </div>

            {/* what he's holding while you browse the covers */}
            <AnimatePresence mode="popLayout">
              {HeldIcon && (
                <motion.span
                  key={held}
                  initial={{ opacity: 0, scale: 0.4, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute top-[56%] -left-5 grid size-8 place-items-center rounded-lg bg-white text-teal shadow-[0_8px_18px_-10px_rgb(10_34_41/0.5)] ring-1 ring-ink/10"
                >
                  <HeldIcon className="size-4" strokeWidth={1.9} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            aria-label="Hide Uncle Cha"
            onClick={() => {
              try {
                sessionStorage.setItem(STORE, "1");
              } catch {}
              setOn(false);
            }}
            className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-white text-slate opacity-0 shadow ring-1 ring-ink/10 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
