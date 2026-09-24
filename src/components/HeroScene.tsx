"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Car, Heart, KeyRound, PawPrint, Sailboat } from "lucide-react";
import { allProducts } from "@/lib/content";
import { coverIcons } from "@/lib/icons";

gsap.registerPlugin(useGSAP, MorphSVGPlugin);

/** The resting roof path, shared with ChaStage. */
export const ROOF_D = "M6 112 C 178 100, 322 38, 400 8 C 478 38, 622 84, 794 104";

/* ---------- Heart monitor ---------- */
const ECG_BASE = 100;
const ECG_STEP = 2;
const ECG_PERIOD = 300; // roof units per beat
const ECG_SPEED = 350; // roof units per second, about 70 beats a minute
const gauss = (u: number, c: number, w: number) => Math.exp(-((u - c) * (u - c)) / (2 * w * w));
/** One cardiac cycle, u in [0, 1): P wave, QRS complex, T wave. Positive values point up. */
const ecg = (u: number) =>
  9 * gauss(u, 0.16, 0.028) - 9 * gauss(u, 0.305, 0.009) + 122 * gauss(u, 0.33, 0.011) - 30 * gauss(u, 0.357, 0.01) + 17 * gauss(u, 0.56, 0.042);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** The trace at time t with overall amplitude amp. The signal travels left to right. */
function ecgPath(t: number, amp: number) {
  let d = "";
  for (let x = 6; x <= 794; x += ECG_STEP) {
    const u = ((((x - ECG_SPEED * t) / ECG_PERIOD) % 1) + 1) % 1;
    const taper = smooth(6, 90, x) * (1 - smooth(710, 794, x));
    const y = ECG_BASE - amp * taper * ecg(u);
    d += `${x === 6 ? "M" : " L"}${x} ${y.toFixed(1)}`;
  }
  return d;
}

/** An umbrella canopy: a dome with a scalloped rim. */
const CANOPY_D =
  "M150 92 C 170 10, 290 -58, 400 -58 C 510 -58, 630 10, 650 92 Q 612 66, 575 92 Q 537 66, 500 92 Q 462 66, 425 92 Q 400 74, 375 92 Q 337 66, 300 92 Q 262 66, 225 92 Q 187 66, 150 92";
/** Height of the canopy (in roof units) at x, for rain to land on. */
const canopyY = (x: number) => {
  const t = (x - 400) / 250;
  return Math.abs(t) >= 1 ? 92 : 92 - 150 * Math.sqrt(1 - t * t);
};

/** Where the roof sits inside the stage, in pixels. Mirrors ChaStage's roof classes. */
function geometry(root: HTMLElement) {
  const W = root.clientWidth;
  const H = root.clientHeight;
  const mobile = window.innerWidth < 640;
  const roofTop = -0.04 * H;
  const roofH = 0.26 * H;
  const roofLeft = 0.01 * W;
  const roofW = 0.97 * W;
  const roofY = (x: number) => {
    const t = Math.min(1, Math.max(0, (x - roofLeft) / roofW));
    const d = Math.abs(t - 0.5) / 0.5;
    return roofTop + roofH * (0.07 + 0.83 * (1 - Math.pow(1 - d, 2.2)));
  };
  // The lane under the words where vehicles drive and water sits (matches ChaStage's bottom padding).
  const lane = Math.max(48, 0.04 * window.innerWidth);
  const toPx = (ux: number, uy: number) => ({ x: roofLeft + (ux / 800) * roofW, y: roofTop + (uy / 120) * roofH });
  return { W, H, lane, toPx, mobile, roofTop, roofH, roofLeft, roofW, roofY, peak: { x: roofLeft + roofW / 2, y: roofTop + roofH * 0.07 } };
}

type G = ReturnType<typeof geometry>;
type Q = (s: string) => Element[];
/** The three "Cha" words, so scenes can make them react. */
type Words = { els: HTMLElement[]; cx: number[] };
type Build = (tl: gsap.core.Timeline, q: Q, g: G, w: Words) => void;

/** A word hops as something passes beneath it. */
const bump = (tl: gsap.core.Timeline, el: HTMLElement, at: number, lift = -12) =>
  tl
    .to(el, { yPercent: lift, scaleY: 1.04, duration: 0.16, ease: "power2.out", transformOrigin: "50% 100%" }, at)
    .to(el, { yPercent: 0, scaleY: 1, duration: 0.55, ease: "bounce.out" }, at + 0.16);

/** Schedule bumps for a vehicle crossing from x0 to x1 over `dur`, starting at `t0`. */
const passBumps = (tl: gsap.core.Timeline, w: Words, x0: number, x1: number, t0: number, dur: number, lift?: number) =>
  w.els.forEach((el, i) => bump(tl, el, t0 + (dur * (w.cx[i] - x0)) / (x1 - x0), lift));

/** Three beats: one, two, three. */
const beat = (tl: gsap.core.Timeline, w: Words, at: number, lift = -10) => w.els.forEach((el, i) => bump(tl, el, at + i * 0.2, lift));

const fadeAll = (tl: gsap.core.Timeline, q: Q, at: string | number = "+=0.6") => tl.to(q(".sc"), { opacity: 0, duration: 0.6, ease: "power1.out" }, at);

const builds: Record<string, Build> = {
  "auto-insurance": (tl, q, g, w) => {
    const car = q(".s-car")[0];
    gsap.set(car, { x: -90, y: g.H - (car as HTMLElement).offsetHeight - 6 });
    tl.fromTo(q(".s-road"), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.out" })
      .to(car, { x: g.W + 20, duration: 2.6, ease: "none" }, 0.35)
      .fromTo(q(".s-car-body"), { y: 0 }, { y: -2.5, duration: 0.14, repeat: 15, yoyo: true, ease: "sine.inOut" }, "<");
    passBumps(tl, w, -90, g.W + 20, 0.35, 2.6, -8);
    fadeAll(tl, q, 3.1);
  },

  "pet-insurance": (tl, q, g, w) => {
    // A trail of paw prints trots across under the words, left, right, left.
    const paws = q(".s-paw");
    const n = paws.length;
    const y0 = g.H - g.lane * 0.62;
    paws.forEach((el, i) => {
      const x = g.roofLeft + ((g.roofW - 30) * (i + 0.5)) / n;
      gsap.set(el, { x, y: y0 + (i % 2 ? 9 : -9), rotation: 90 });
    });
    const dur = 2.2;
    tl.fromTo(paws, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, stagger: dur / n, ease: "back.out(3)" }, 0.2)
      .to(paws, { opacity: 0, duration: 0.5, stagger: dur / n }, 1.0);
    passBumps(tl, w, g.roofLeft, g.roofLeft + g.roofW, 0.2, dur, -7);
    fadeAll(tl, q, 3.3);
  },

  "boat-insurance": (tl, q, g, w) => {
    const boat = q(".s-boat")[0];
    const water = Math.max(18, g.lane * 0.55);
    gsap.set(q(".s-water"), { height: water });
    gsap.set(boat, { x: g.W * 0.05, y: g.H - water - (boat as HTMLElement).offsetHeight + 8 });
    tl.fromTo(q(".s-water"), { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "power2.out" })
      .to(q(".s-wave"), { xPercent: -50, duration: 3.4, ease: "none" }, 0)
      .fromTo(boat, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.4)
      .to(boat, { x: g.W * 0.82, duration: 3, ease: "sine.inOut" }, 0.4)
      .to(q(".s-boat-body"), { y: -5, rotation: 5, duration: 0.5, repeat: 5, yoyo: true, ease: "sine.inOut" }, 0.4)
      .to(q(".s-water"), { yPercent: 100, duration: 0.8, ease: "power2.in" }, "-=0.4");
    tl.to(w.els, { rotation: (i: number) => [-2.5, 2, -2.5][i], yPercent: -3, duration: 0.7, ease: "sine.inOut", transformOrigin: "50% 100%", repeat: 3, yoyo: true }, 0.5).to(
      w.els,
      { rotation: 0, yPercent: 0, duration: 0.5, ease: "sine.out" },
    );
    fadeAll(tl, q, "-=0.2");
  },

  "homeowners-insurance": (tl, q, g, w) => {
    const top = g.roofY(g.roofLeft + 4);
    const bottom = g.H - 4;
    gsap.set(q(".s-wall-l"), { x: g.roofLeft + 6, y: top, height: bottom - top });
    gsap.set(q(".s-wall-r"), { x: g.roofLeft + g.roofW - 8, y: g.roofY(g.roofLeft + g.roofW - 4), height: bottom - g.roofY(g.roofLeft + g.roofW - 4) });
    gsap.set(q(".s-floor"), { x: g.roofLeft + 6, y: bottom, width: g.roofW - 12 });
    gsap.set(q(".s-window"), { x: g.peak.x - 9, y: g.peak.y + Math.max(18, g.roofH * 0.35) });
    tl.fromTo(q(".s-wall-l, .s-wall-r"), { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: "power2.inOut", stagger: 0.1 })
      .fromTo(q(".s-floor"), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, "-=0.2")
      .fromTo(q(".s-window"), { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.5)" }, "-=0.3");
    tl.to(w.els, { scaleY: 0.93, scaleX: 1.03, duration: 0.14, ease: "power2.out", transformOrigin: "50% 100%" }, "-=0.35").to(w.els, {
      scaleY: 1,
      scaleX: 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)",
    });
    fadeAll(tl, q, "+=0.9");
  },

  "renters-insurance": (tl, q, g, w) => {
    const key = q(".s-key")[0];
    const at = { x: g.peak.x - 20, y: g.peak.y + Math.max(14, g.roofH * 0.3) };
    gsap.set(key, { x: at.x, y: at.y - 120, rotation: -120, opacity: 0, transformOrigin: "30% 30%" });
    gsap.set(q(".s-ring"), { x: at.x - 10, y: at.y - 10 });
    tl.to(key, { y: at.y, rotation: -20, opacity: 1, duration: 0.9, ease: "back.out(1.4)" })
      .to(key, { rotation: 70, duration: 0.35, ease: "power3.in" }, "+=0.15")
      .fromTo(q(".s-ring"), { scale: 0.3, opacity: 0.7 }, { scale: 2.2, opacity: 0, duration: 0.8, ease: "power2.out" })
      .to(key, { rotation: 60, duration: 0.2, ease: "power1.out" }, "<");
    beat(tl, w, 1.5);
    fadeAll(tl, q, 2.6);
  },

  "condo-insurance": (tl, q, g, w) => {
    const step = Math.max(14, g.roofH * 0.42);
    q(".s-floor-roof").forEach((el, i) => gsap.set(el, { y: -(i + 1) * step, scaleX: 0.72 - i * 0.2 }));
    tl.fromTo(q(".s-floor-roof"), { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.6, stagger: 0.25, ease: "back.out(1.6)" })
      .to(w.els, { yPercent: -6, duration: 0.6, stagger: 0.08, ease: "power2.out" }, 0.2)
      .to(w.els, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "power2.inOut" }, 2.2)
      .to(q(".s-floor-roof"), { yPercent: 40, opacity: 0, duration: 0.5, stagger: { each: 0.15, from: "end" }, ease: "power2.in" }, "+=1.3");
  },

  "flood-insurance": (tl, q, g, w) => {
    tl.fromTo(q(".s-flood"), { height: 0 }, { height: g.H * 0.36, duration: 1.4, ease: "sine.inOut" })
      .to(q(".s-wave"), { xPercent: -50, duration: 3.6, ease: "none" }, 0)
      .to(w.els, { yPercent: -7, rotation: (i: number) => [-2, 1.5, -1.5][i], duration: 1.4, ease: "sine.inOut", transformOrigin: "50% 100%", stagger: 0.1 }, 0.2)
      .to(w.els, { yPercent: -4, rotation: (i: number) => [1, -1, 1][i], duration: 0.9, ease: "sine.inOut" }, 1.6)
      .to(q(".s-flood"), { height: 0, duration: 1.2, ease: "sine.inOut" }, 2.4)
      .to(w.els, { yPercent: 0, rotation: 0, duration: 1.1, ease: "sine.inOut" }, 2.45);
  },

  "life-insurance": (tl, q, g, w) => {
    const at = { x: g.peak.x - 16, y: g.peak.y + Math.max(12, g.roofH * 0.28) };
    gsap.set(q(".s-heart"), { x: at.x, y: at.y });
    gsap.set(q(".s-mini"), { x: at.x + 8, y: at.y });
    tl.fromTo(q(".s-heart"), { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" })
      .to(q(".s-heart"), { scale: 1.22, duration: 0.14, repeat: 3, yoyo: true, ease: "power1.inOut" }, "+=0.15")
      .to(w.els, { scale: (i: number) => (i === 1 ? 1.05 : 1.02), duration: 0.14, repeat: 3, yoyo: true, ease: "power1.inOut", transformOrigin: "50% 100%" }, "<")
      .fromTo(
        q(".s-mini"),
        { opacity: 0, scale: 0.5 },
        {
          opacity: 0.9,
          scale: 1,
          x: (i: number) => at.x + 8 + [-60, -24, 24, 60][i],
          y: (i: number) => at.y + [30, 55, 55, 30][i],
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.2",
      )
      .to(q(".s-mini"), { opacity: 0, y: "+=16", duration: 0.6, stagger: 0.06 }, "+=0.4");
    fadeAll(tl, q, "-=0.3");
  },

  "health-insurance": (tl, q, g, w) => {
    const roof = q(".__roof")[0] as SVGPathElement;
    const svg = roof.ownerSVGElement!;
    const home = roof.getAttribute("d")!;
    const RUN = 3.4;
    const toUnit = (px: number) => ((px - g.roofLeft) / g.roofW) * 800;
    const wordX = w.cx.map(toUnit);
    const state = { t: 0, prev: 0 };

    // The roof settles into a flat trace, then the heartbeat runs across it.
    tl.to(roof, { morphSVG: ecgPath(0, 0), duration: 0.65, ease: "power2.inOut" }, 0.05)
      .to(svg, { filter: "drop-shadow(0 0 6px rgb(208 20 44 / 0.35))", duration: 0.5 }, 0.3)
      .to(
        state,
        {
          t: RUN,
          duration: RUN,
          ease: "none",
          onUpdate() {
            const t = state.t;
            const amp = smooth(0, 0.45, t) * (1 - smooth(RUN - 0.6, RUN, t));
            roof.setAttribute("d", ecgPath(t, amp));
            // A word hops as a spike passes under it.
            if (amp > 0.4) {
              for (let k = -1; k < 4; k++) {
                const now = ECG_SPEED * t + ECG_PERIOD * (k + 0.33);
                const before = ECG_SPEED * state.prev + ECG_PERIOD * (k + 0.33);
                wordX.forEach((x, i) => {
                  if (before < x && now >= x) {
                    gsap
                      .timeline()
                      .to(w.els[i], { yPercent: -7 * amp, duration: 0.12, ease: "power2.out", transformOrigin: "50% 100%" })
                      .to(w.els[i], { yPercent: 0, duration: 0.45, ease: "power2.out" });
                  }
                });
              }
            }
            state.prev = t;
          },
        },
        0.72,
      )
      .to(roof, { morphSVG: home, duration: 0.85, ease: "power3.inOut" }, 0.72 + RUN)
      .to(svg, { filter: "drop-shadow(0 0 0px rgb(208 20 44 / 0))", duration: 0.5, clearProps: "filter" }, 0.72 + RUN);
  },

  "umbrella-insurance": (tl, q, g, w) => {
    const roof = q(".__roof")[0] as SVGPathElement;
    const roofSvg = roof.ownerSVGElement!;
    const home = roof.getAttribute("d")!;

    // The handle is drawn in true pixels so its hook stays round.
    const handleSvg = q(".s-handle")[0] as SVGSVGElement;
    handleSvg.setAttribute("viewBox", `0 0 ${g.W} ${g.H}`);
    const top = g.toPx(400, -58);
    const rim = g.toPx(400, 92);
    const r = Math.max(6, g.H * 0.03);
    const drop = Math.max(14, g.H * 0.07);
    const shaft = q(".s-shaft")[0] as SVGPathElement;
    const tip = q(".s-tip")[0] as SVGPathElement;
    shaft.setAttribute(
      "d",
      `M${top.x} ${top.y} L${rim.x} ${rim.y + drop} A ${r} ${r} 0 0 1 ${rim.x - 2 * r} ${rim.y + drop} L${rim.x - 2 * r} ${rim.y + drop - r * 0.5}`,
    );
    tip.setAttribute("d", `M${top.x} ${top.y} L${top.x} ${top.y - Math.max(8, g.H * 0.04)}`);
    const len = shaft.getTotalLength();
    gsap.set(shaft, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(tip, { strokeDasharray: 20, strokeDashoffset: 20 });

    tl.to(roof, { morphSVG: CANOPY_D, duration: 1, ease: "power3.inOut" }, 0.05)
      .to(tip, { strokeDashoffset: 0, duration: 0.25, ease: "power2.out" }, 0.85)
      .to(shaft, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, 0.9);

    // Held in a hand: a gentle sway around the canopy tip.
    const sway = [roofSvg, handleSvg];
    gsap.set(roofSvg, { svgOrigin: undefined, transformOrigin: `${top.x - g.roofLeft}px ${top.y - g.roofTop}px` });
    gsap.set(handleSvg, { transformOrigin: `${top.x}px ${top.y}px` });
    tl.to(sway, { rotation: -2.5, duration: 0.7, ease: "sine.inOut" }, 1.5)
      .to(sway, { rotation: 1.8, duration: 0.8, ease: "sine.inOut" })
      .to(sway, { rotation: -0.8, duration: 0.7, ease: "sine.inOut" })
      .to(sway, { rotation: 0, duration: 0.6, ease: "sine.out" });

    // Rain arrives once the umbrella is open, and slides off the canopy.
    q(".s-drop").forEach((d) => {
      const ux = 170 + Math.random() * 460;
      const start = g.toPx(ux, -260 - Math.random() * 160);
      const hit = g.toPx(ux, canopyY(ux) - 6);
      const t = 1.1 + Math.random() * 1.8;
      gsap.set(d, { x: start.x, y: start.y, opacity: 0, scaleX: 1, scaleY: 1 });
      tl.to(d, { opacity: 0.85, duration: 0.08 }, t)
        .to(d, { y: hit.y, duration: 0.45, ease: "power2.in" }, t)
        .to(d, { scaleY: 0.15, scaleX: 5, x: `+=${ux < 400 ? -6 : 6}`, opacity: 0, duration: 0.22, ease: "power2.out" }, t + 0.45);
    });
    // Everyone underneath stays dry: a small, happy one-two-three.
    beat(tl, w, 2.4, -6);
    tl.to(shaft, { strokeDashoffset: len, duration: 0.45, ease: "power2.in" }, 3.9)
      .to(tip, { strokeDashoffset: 20, duration: 0.2, ease: "power2.in" }, 4.2)
      .to(handleSvg, { opacity: 0, duration: 0.25 }, 4.3)
      .to(roof, { morphSVG: home, duration: 0.9, ease: "power3.inOut" }, 4.25);
  },

  "business-insurance": (tl, q, g, w) => {
    const blocks = q(".s-block");
    const n = blocks.length;
    blocks.forEach((b, i) => {
      const w = g.W / n;
      gsap.set(b, { x: i * w + w * 0.12, width: w * 0.76, height: g.H * [0.38, 0.62, 0.48, 0.74, 0.44, 0.66, 0.52, 0.36][i % 8] });
    });
    tl.fromTo(blocks, { scaleY: 0 }, { scaleY: 1, duration: 0.9, stagger: { each: 0.07, from: "center" }, ease: "power3.out" })
      .to(w.els, { yPercent: -5, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.2)
      .to(w.els, { yPercent: 0, duration: 0.7, ease: "power2.inOut" }, 2.1)
      .to(blocks, { scaleY: 0, duration: 0.7, stagger: { each: 0.05, from: "edges" }, ease: "power2.in" }, "+=1.4");
  },

  bundle: (tl, q, g, w) => {
    const icons = q(".s-parade");
    const n = icons.length;
    icons.forEach((el, i) => {
      const x = g.roofLeft + g.roofW * (0.12 + (0.76 * i) / (n - 1));
      gsap.set(el, { x: x - 14, y: g.roofY(x) + (g.mobile ? 8 : 14) });
    });
    tl.fromTo(icons, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, stagger: 0.07, ease: "back.out(2.2)" })
      .to(icons, { y: "-=6", duration: 0.3, stagger: 0.04, yoyo: true, repeat: 1, ease: "sine.inOut" }, "+=0.2");
    beat(tl, w, 1.2);
    fadeAll(tl, q, "+=0.8");
  },
};

const iconClass = "size-8 sm:size-11 text-ink";

function Markup({ kind }: { kind: string }) {
  const road = (
    <svg className="sc s-road absolute bottom-0.5 left-0 z-20 h-2 w-full origin-left" viewBox="0 0 100 4" preserveAspectRatio="none">
      <line x1="0" y1="2" x2="100" y2="2" stroke="rgb(29 26 32 / 0.25)" strokeWidth="1.5" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
  const wave = (
    <svg className="s-wave absolute -top-3 left-0 h-4 w-[200%]" viewBox="0 0 200 8" preserveAspectRatio="none">
      <path
        d={`M0 4 ${Array.from({ length: 20 }, (_, i) => `Q ${i * 10 + 2.5} 0, ${i * 10 + 5} 4 T ${i * 10 + 10} 4`).join(" ")} V8 H0 Z`}
        fill="rgb(27 107 102 / 0.14)"
      />
    </svg>
  );

  switch (kind) {
    case "auto-insurance":
      return (
        <>
          {road}
          <div className="sc s-car absolute top-0 left-0 z-20">
            <div className="s-car-body flex items-center gap-1">
              <span className="flex flex-col gap-1 opacity-40">
                <span className="h-px w-5 bg-ink" />
                <span className="h-px w-8 bg-ink" />
                <span className="h-px w-4 bg-ink" />
              </span>
              <Car className={iconClass} strokeWidth={1.5} />
            </div>
          </div>
        </>
      );
    case "pet-insurance":
      return (
        <>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="sc s-paw absolute top-0 left-0 z-20">
              <PawPrint className="size-5 fill-teal/15 text-teal sm:size-6" strokeWidth={1.75} />
            </span>
          ))}
        </>
      );
    case "boat-insurance":
      return (
        <>
          <div className="sc s-water absolute inset-x-0 bottom-0 z-20 bg-teal/14">{wave}</div>
          <div className="sc s-boat absolute top-0 left-0 z-20">
            <div className="s-boat-body">
              <Sailboat className="size-9 text-teal sm:size-12" strokeWidth={1.5} />
            </div>
          </div>
        </>
      );
    case "homeowners-insurance":
      return (
        <>
          <span className="sc s-wall-l absolute top-0 left-0 z-20 w-[3px] origin-top rounded-full bg-red" />
          <span className="sc s-wall-r absolute top-0 left-0 z-20 w-[3px] origin-top rounded-full bg-red" />
          <span className="sc s-floor absolute top-0 left-0 z-20 h-px origin-center bg-ink/20" />
          <span className="sc s-window absolute top-0 left-0 z-20 size-[18px] rounded-[3px] bg-red" />
        </>
      );
    case "renters-insurance":
      return (
        <>
          <span className="sc s-ring absolute top-0 left-0 z-20 size-14 rounded-full border border-teal" />
          <div className="sc s-key absolute top-0 left-0 z-20">
            <KeyRound className={iconClass} strokeWidth={1.5} />
          </div>
        </>
      );
    case "condo-insurance":
      return (
        <>
          {[0, 1].map((i) => (
            <svg
              key={i}
              className="sc s-floor-roof absolute -top-[1%] left-[1%] z-20 h-[16%] w-[97%] overflow-visible text-red/70 sm:-top-[4%] sm:h-[26%]"
              viewBox="0 0 800 120"
              preserveAspectRatio="none"
              fill="none"
            >
              <path d={ROOF_D} stroke="currentColor" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          ))}
        </>
      );
    case "flood-insurance":
      return (
        <div className="sc s-flood absolute inset-x-0 bottom-0 z-20 h-0 bg-teal/12">
          {wave}
        </div>
      );
    case "life-insurance":
      return (
        <>
          <div className="sc s-heart absolute top-0 left-0 z-20">
            <Heart className="size-8 fill-red/15 text-red sm:size-10" strokeWidth={1.5} />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="sc s-mini absolute top-0 left-0 z-20">
              <Heart className="size-3.5 fill-red/20 text-red/70" strokeWidth={1.5} />
            </span>
          ))}
        </>
      );
    case "umbrella-insurance":
      return (
        <>
          {Array.from({ length: 44 }, (_, i) => (
            <span key={i} className="sc s-drop absolute top-0 left-0 z-20 h-7 w-[2px] origin-bottom rounded-full bg-gradient-to-b from-teal/0 to-teal" />
          ))}
          <svg className="sc s-handle absolute inset-0 z-20 h-full w-full overflow-visible" fill="none">
            <path className="s-tip [stroke-width:var(--roof-w)]" stroke="#d0142c" strokeLinecap="round" />
            <path
              className="s-shaft [stroke-width:calc(var(--roof-w)*0.8)]"
              stroke="#d0142c"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      );
    case "business-insurance":
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="sc s-block absolute bottom-0 left-0 z-0 origin-bottom rounded-t-lg bg-mist/80">
              <span className="absolute inset-x-[22%] top-[14%] h-[40%] bg-[repeating-linear-gradient(to_bottom,rgb(255_255_255/0.9)_0_5px,transparent_5px_14px)]" />
            </span>
          ))}
        </>
      );
    case "bundle":
      return (
        <>
          {allProducts.map((p) => {
            const Icon = coverIcons[p.slug];
            return (
              <span key={p.slug} className="sc s-parade absolute top-0 left-0 z-20 grid size-7 place-items-center rounded-full bg-white shadow-sm ring-1 ring-ink/10 sm:size-8">
                <Icon className="size-3.5 text-ink sm:size-4" strokeWidth={1.75} />
              </span>
            );
          })}
        </>
      );
    default:
      return null;
  }
}

/** A short, calm scene that plays around the roof when a cover is picked in the hero. */
export default function HeroScene({ kind, delay = 0 }: { kind: string; delay?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(root.current!.querySelectorAll(".sc"), { opacity: 0 });
        return;
      }
      const build = builds[kind];
      if (!build) return;
      const stageEl = root.current!.parentElement!;
      const roofPath = stageEl.querySelector<SVGPathElement>(".hero-roof path");
      const local = gsap.utils.selector(root);
      const q = ((sel: string) => (sel === ".__roof" ? (roofPath ? [roofPath] : []) : local(sel))) as unknown as Q;
      const morphs = kind === "health-insurance" || kind === "umbrella-insurance";
      gsap.set(q(".sc"), { opacity: 1 });
      const stage = root.current!.parentElement!;
      const sr = stage.getBoundingClientRect();
      const els = Array.from(stage.querySelectorAll<HTMLElement>(".cha-hop"));
      const words: Words = {
        els,
        cx: els.map((el) => {
          const b = el.getBoundingClientRect();
          return b.left + b.width / 2 - sr.left;
        }),
      };
      const tl = gsap.timeline({ delay });
      // The roof takes a breath as it welcomes the new cover in, unless it is about to change shape.
      const roof = stage.querySelector(".hero-roof");
      if (roof && !morphs)
        tl.fromTo(roof, { scaleY: 1 }, { scaleY: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 100%" }, 0);

      // While the roof morphs, ChaStage stops steering it.
      const unlock = () => roofPath && delete roofPath.dataset.locked;
      if (morphs && roofPath) {
        roofPath.dataset.locked = "1";
        tl.eventCallback("onComplete", unlock);
      }
      build(tl, q, geometry(root.current!), words);
      return unlock;
    },
    { scope: root, dependencies: [kind] },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${kind === "business-insurance" ? "z-0" : "z-20"}`}
      style={{ clipPath: "inset(-30% 0 0 0)" }}
    >
      <Markup kind={kind} />
    </div>
  );
}
