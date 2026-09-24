"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Car, Heart, KeyRound, Sailboat } from "lucide-react";
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
/** The roof lifted high, to make room for everything moving in underneath. */
const LIFTED_D = "M6 112 C 150 78, 300 -40, 400 -74 C 500 -40, 650 78, 794 112";

/** Where a path sits vertically at x (both in roof units). */
function pathYAt(d: string, x: number) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
  el.setAttribute("d", d);
  const len = el.getTotalLength();
  let best = el.getPointAtLength(0);
  for (let l = 0; l <= len; l += 4) {
    const pt = el.getPointAtLength(l);
    if (Math.abs(pt.x - x) < Math.abs(best.x - x)) best = pt;
  }
  return best.y;
}

/**
 * A dog peeking over the words, drawn as one line like the roof.
 * Built in pixels (so the head stays round), then mapped into roof units.
 * rise: 0 = hidden behind the letters, 1 = fully up. pawLift and earTilt animate the pose.
 */
function dogPath(g: G, cx: number, top: number, r: number, rise: number, pawLift = 0, earFlap = 0) {
  const u = (x: number, y: number) => `${(((x - g.roofLeft) / g.roofW) * 800).toFixed(1)} ${g.toUnitY(y).toFixed(1)}`;
  const h = (k: number) => top - k * r * rise; // height above the letters, scaled by how far up the dog is
  // A paw: two little toe bumps resting on the letters.
  const paw = (from: number, to: number) => {
    const mid = (from + to) / 2;
    const k = 0.28 + 0.2 * pawLift;
    return [
      `C${u(from, h(k))} ${u(mid, h(k))} ${u(mid, h(0.02))}`,
      `C${u(mid, h(k))} ${u(to, h(k))} ${u(to, top)}`,
    ].join(" ");
  };
  const e = earFlap * 0.12;
  return [
    `M${u(cx - 1.95 * r, top)}`,
    paw(cx - 1.95 * r, cx - 1.45 * r),
    `L${u(cx - 0.72 * r, top)}`,
    // left side of the face up to where the ear hangs
    `C${u(cx - 0.8 * r, h(0.45))} ${u(cx - 0.78 * r, h(0.85))} ${u(cx - 0.66 * r, h(1.12))}`,
    // left floppy ear: out and down to the tip, then back up to the top of the head
    `C${u(cx - (0.86 + e) * r, h(1.3))} ${u(cx - (1.16 + e) * r, h(1.12))} ${u(cx - (1.14 + e) * r, h(0.62 - e))}`,
    `C${u(cx - (1.13 + e) * r, h(0.38 - e))} ${u(cx - (0.92 + e) * r, h(0.36 - e))} ${u(cx - 0.88 * r, h(0.6))}`,
    `C${u(cx - 0.84 * r, h(0.95))} ${u(cx - 0.74 * r, h(1.3))} ${u(cx - 0.46 * r, h(1.42))}`,
    // top of the head
    `C${u(cx - 0.18 * r, h(1.56))} ${u(cx + 0.18 * r, h(1.56))} ${u(cx + 0.46 * r, h(1.42))}`,
    // right floppy ear, mirrored
    `C${u(cx + 0.74 * r, h(1.3))} ${u(cx + 0.84 * r, h(0.95))} ${u(cx + 0.88 * r, h(0.6))}`,
    `C${u(cx + (0.92 + e) * r, h(0.36 - e))} ${u(cx + (1.13 + e) * r, h(0.38 - e))} ${u(cx + (1.14 + e) * r, h(0.62 - e))}`,
    `C${u(cx + (1.16 + e) * r, h(1.12))} ${u(cx + (0.86 + e) * r, h(1.3))} ${u(cx + 0.66 * r, h(1.12))}`,
    // right side of the face back down
    `C${u(cx + 0.78 * r, h(0.85))} ${u(cx + 0.8 * r, h(0.45))} ${u(cx + 0.72 * r, top)}`,
    `L${u(cx + 1.45 * r, top)}`,
    paw(cx + 1.45 * r, cx + 1.95 * r),
  ].join(" ");
}

/**
 * A car in side profile, drawn as one line like the roof.
 * x is the rear bumper, top is the road (the tops of the letters), L the car's length. Built in pixels, mapped to roof units.
 */
function carPath(g: G, x: number, top: number, L: number, bob = 0) {
  const u = (px: number, py: number) => `${(((px - g.roofLeft) / g.roofW) * 800).toFixed(1)} ${g.toUnitY(py).toFixed(1)}`;
  const rw = L * 0.1; // wheel radius
  const H = L * 0.36; // body height above the axle line
  const base = top - rw + bob; // body sits at axle height
  const X = (f: number) => x + f * L;
  const Y = (f: number) => base - f * H;
  const K = 0.5523;
  // wheel arch: a half circle over a wheel centred at cxw
  const arch = (cxw: number) => {
    const ar = rw * 1.18;
    return [
      `L${u(cxw + ar, base)}`,
      `C${u(cxw + ar, base - K * ar)} ${u(cxw + K * ar, base - ar)} ${u(cxw, base - ar)}`,
      `C${u(cxw - K * ar, base - ar)} ${u(cxw - ar, base - K * ar)} ${u(cxw - ar, base)}`,
    ].join(" ");
  };
  return [
    `M${u(X(0.02), base)}`,
    // rear, trunk, the roof (a nod to the logo's roof), windshield, hood, nose
    `C${u(X(0), Y(0.3))} ${u(X(0.01), Y(0.55))} ${u(X(0.05), Y(0.6))}`,
    `L${u(X(0.16), Y(0.66))}`,
    `C${u(X(0.24), Y(0.98))} ${u(X(0.34), Y(1.06))} ${u(X(0.46), Y(1.06))}`,
    `C${u(X(0.58), Y(1.06))} ${u(X(0.66), Y(0.9))} ${u(X(0.74), Y(0.64))}`,
    `C${u(X(0.84), Y(0.6))} ${u(X(0.95), Y(0.56))} ${u(X(0.99), Y(0.42))}`,
    `C${u(X(1.0), Y(0.3))} ${u(X(1.0), Y(0.1))} ${u(X(0.97), base)}`,
    // underside, dipping over both wheels, back to the rear
    arch(X(0.78)),
    arch(X(0.22)),
    `L${u(X(0.02), base)}`,
  ].join(" ");
}

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
  const toUnitY = (py: number) => ((py - roofTop) / roofH) * 120;
  return { W, H, lane, toPx, toUnitY, mobile, roofTop, roofH, roofLeft, roofW, roofY, peak: { x: roofLeft + roofW / 2, y: roofTop + roofH * 0.07 } };
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
    const roof = q(".__roof")[0] as SVGPathElement;
    const home = roof.getAttribute("d")!;
    const stage = roof.ownerSVGElement!.parentElement!;
    const sr = stage.getBoundingClientRect();
    const first = w.els[0].getBoundingClientRect();
    const last = w.els[2].getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(w.els[1]).fontSize);
    // "Cha Cha Cha" is the road: the car drives along the tops of the letters.
    // Cap height of the letters: where the wheels actually touch.
    const top = first.top - sr.top + fs * 0.2;
    const L = fs * 1.35;
    const rw = L * 0.1;
    const startX = first.left - sr.left;
    const endX = last.right - sr.left - L;
    const DRIVE = 2.4;

    const wheels = q(".s-wheel") as HTMLElement[];
    const speed = q(".s-speed") as HTMLElement[];
    wheels.forEach((el) => gsap.set(el, { width: rw * 2, height: rw * 2, opacity: 0 }));
    const place = (x: number, bob: number, spin: number) => {
      roof.setAttribute("d", carPath(g, x, top, L, bob));
      [0.22, 0.78].forEach((f, i) => gsap.set(wheels[i], { x: x + f * L - rw, y: top - 2 * rw, rotation: spin }));
      speed.forEach((el, i) => gsap.set(el, { x: x - fs * (0.28 + i * 0.1), y: top - rw * (1.6 + i * 0.9) }));
    };

    // The roof becomes a parked car at the start of the road.
    tl.to(roof, { morphSVG: carPath(g, startX, top, L), duration: 0.8, ease: "power3.inOut" }, 0.05)
      .call(() => place(startX, 0, 0), undefined, 0.86)
      .to(wheels, { opacity: 1, duration: 0.2 }, 0.86);

    // Drive: ease away, cruise, ease to a stop. Wheels spin with the distance travelled.
    const st = { p: 0 };
    tl.to(
      st,
      {
        p: 1,
        duration: DRIVE,
        ease: "power1.inOut",
        onUpdate() {
          const x = startX + (endX - startX) * st.p;
          const moving = Math.sin(Math.PI * st.p);
          const bob = Math.sin(st.p * 60) * 1.4 * moving;
          place(x, bob, ((x - startX) / rw) * (180 / Math.PI));
          speed.forEach((el, i) => gsap.set(el, { opacity: 0.55 * moving, scaleX: 0.6 + moving * (0.6 + 0.2 * i) }));
        },
      },
      1.05,
    );
    // Each "Cha" dips a little as the car rolls over it.
    passBumps(tl, w, startX, endX + L * 0.5, 1.05, DRIVE, 3);

    // Parked at the end, it folds back into the roof.
    tl.to(wheels, { opacity: 0, duration: 0.2 }, 1.05 + DRIVE + 0.1)
      .to(roof, { morphSVG: home, duration: 0.9, ease: "power3.inOut" }, 1.05 + DRIVE + 0.15);
  },

  "pet-insurance": (tl, q, g, w) => {
    const roof = q(".__roof")[0] as SVGPathElement;
    const home = roof.getAttribute("d")!;
    const stage = roof.ownerSVGElement!.parentElement!;
    const sr = stage.getBoundingClientRect();
    const mid = w.els[1];
    const mr = mid.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(mid).fontSize);
    // The dog sits behind the middle "Cha", paws on the tops of the letters.
    const top = mr.top - sr.top + fs * 0.12;
    const cx = mr.left - sr.left + mr.width * 0.42;
    const r = fs * 0.36;
    const pose = (rise: number, paw = 0, ear = 0) => dogPath(g, cx, top, r, rise, paw, ear);

    const face = q(".s-face")[0] as HTMLElement;
    gsap.set(face, { x: cx, y: top - r * 0.78, xPercent: -50, yPercent: -50 });
    gsap.set(q(".s-face-part"), { width: r * 1.3, height: r * 1.1 });

    tl.to(roof, { morphSVG: pose(0), duration: 0.6, ease: "power2.inOut" }, 0.05)
      // up it pops, with a little overshoot
      .to(roof, { morphSVG: pose(1), duration: 0.55, ease: "back.out(2.2)" }, 0.7)
      .fromTo(face, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)" }, 1.05)
      // pat, pat
      .to(roof, { morphSVG: pose(1, 1), duration: 0.14, ease: "power2.out" }, 1.45)
      .to(roof, { morphSVG: pose(1, 0), duration: 0.16, ease: "power2.in" }, 1.59)
      .to(roof, { morphSVG: pose(1, 1), duration: 0.14, ease: "power2.out" }, 1.8)
      .to(roof, { morphSVG: pose(1, 0), duration: 0.16, ease: "power2.in" }, 1.94);
    [1.75, 2.1].forEach((t) => bump(tl, mid, t, -3));
    tl.fromTo(q(".s-tongue"), { scaleY: 0.4 }, { scaleY: 1, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" }, 2.15);
    // blink, ear flap, blink
    tl.to(q(".s-eye"), { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut" }, 2.35)
      .to(roof, { morphSVG: pose(1, 0, 1), duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" }, 2.6)
      .to(q(".s-eye"), { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut" }, 3.05)
      // and back down behind the letters
      .to(face, { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" }, 3.45)
      .to(roof, { morphSVG: pose(0), duration: 0.45, ease: "power2.in" }, 3.45)
      .to(roof, { morphSVG: home, duration: 0.8, ease: "power3.inOut" }, 3.95);
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
    const roof = q(".__roof")[0] as SVGPathElement;
    const home = roof.getAttribute("d")!;
    // The roof grows walls, a chimney and a floor, and "Cha Cha Cha" ends up inside.
    const floor = g.toUnitY(g.H - g.lane * 0.3);
    const slope = (x: number) => 2 + ((x - 400) / 434) * 110;
    const HOUSE_D = `M-8 ${floor} L-8 106 L400 2 L566 ${slope(566)} L566 -12 L618 -12 L618 ${slope(618)} L834 112 L834 ${floor} Z`;

    const glow = q(".s-glow path")[0];
    glow.setAttribute("d", HOUSE_D);
    const win = q(".s-house-window")[0];
    const peak = g.toPx(400, 2);
    gsap.set(win, { x: peak.x - 9, y: peak.y + Math.max(20, g.roofH * 0.34) });
    const chim = g.toPx(592, -12);
    q(".s-smoke").forEach((el, i) => gsap.set(el, { x: chim.x - 6 + i * 3, y: chim.y - 10 }));

    tl.to(roof, { morphSVG: HOUSE_D, duration: 1.1, ease: "power3.inOut" }, 0.05)
      .fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out" }, 1.0)
      .fromTo(win, { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2.6)" }, 1.05)
      .fromTo(
        q(".s-smoke"),
        { opacity: 0, scale: 0.4 },
        { opacity: 0.5, scale: 1.6, y: "-=46", x: (i: number) => `+=${[6, -4, 10][i]}`, duration: 1.6, stagger: 0.35, ease: "sine.out" },
        1.2,
      )
      .to(q(".s-smoke"), { opacity: 0, duration: 0.6, stagger: 0.35 }, 2.2)
      // Home: the words settle in with a soft squash.
      .to(w.els, { scaleY: 0.94, scaleX: 1.02, duration: 0.16, ease: "power2.out", transformOrigin: "50% 100%", stagger: 0.08 }, 1.2)
      .to(w.els, { scaleY: 1, scaleX: 1, duration: 0.8, ease: "elastic.out(1, 0.45)", stagger: 0.08 }, 1.36)
      .to([glow, win], { opacity: 0, duration: 0.5 }, 3.4)
      .to(roof, { morphSVG: home, duration: 1, ease: "power3.inOut" }, 3.5);
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
    const roof = q(".__roof")[0] as SVGPathElement;
    const home = roof.getAttribute("d")!;
    const icons = q(".s-parade");
    const n = icons.length;
    const size = (icons[0] as HTMLElement).offsetWidth;

    // Landing spots follow the lifted roof, tucked just beneath it.
    const spots = icons.map((_, i) => {
      const ux = 205 + (390 * i) / (n - 1);
      const pt = g.toPx(ux, pathYAt(LIFTED_D, ux));
      return { x: pt.x - size / 2, y: pt.y + size * 0.3 };
    });
    icons.forEach((el, i) => {
      const ang = (i / n) * Math.PI * 2 + 0.6;
      gsap.set(el, {
        x: spots[i].x + Math.cos(ang) * g.W * 0.6,
        y: spots[i].y - Math.abs(Math.sin(ang)) * g.H * 0.9 - 40,
        rotation: gsap.utils.random(-160, 160),
        scale: 0.6,
        opacity: 0,
      });
    });

    tl.to(roof, { morphSVG: LIFTED_D, duration: 0.8, ease: "power3.inOut" }, 0.05);
    icons.forEach((el, i) => {
      const t = 0.45 + i * 0.07;
      tl.to(el, { opacity: 1, duration: 0.2 }, t).to(el, { x: spots[i].x, y: spots[i].y, rotation: 0, scale: 1, duration: 0.75, ease: "back.out(1.5)" }, t);
    });
    // Everyone is in: the roof settles over them and the words dance.
    const settled = 0.45 + n * 0.07 + 0.65;
    tl.to(roof, { morphSVG: "M6 112 C 150 84, 300 -24, 400 -56 C 500 -24, 650 84, 794 112", duration: 0.35, ease: "power2.out" }, settled)
      .to(icons, { y: "+=5", duration: 0.35, ease: "power2.out" }, settled)
      .to(icons, { y: "-=5", duration: 0.5, ease: "elastic.out(1, 0.5)" }, settled + 0.35);
    beat(tl, w, settled + 0.2, -8);
    tl.to(icons, { opacity: 0, y: "+=18", scale: 0.8, duration: 0.45, stagger: { each: 0.03, from: "edges" }, ease: "power2.in" }, settled + 1.3)
      .to(roof, { morphSVG: home, duration: 0.85, ease: "power3.inOut" }, settled + 1.55);
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
          {[0, 1].map((i) => (
            <span key={i} className="sc s-wheel absolute top-0 left-0 z-20 rounded-full border-[3px] border-ink bg-porcelain" style={{ opacity: 0 }}>
              <span className="absolute top-[18%] left-1/2 h-[64%] w-[3px] -translate-x-1/2 rounded-full bg-ink/60" />
              <span className="absolute top-1/2 left-1/2 size-[26%] -translate-1/2 rounded-full bg-red" />
            </span>
          ))}
          {[0, 1, 2].map((i) => (
            <span key={i} className="sc s-speed absolute top-0 left-0 z-20 h-[3px] w-10 origin-right rounded-full bg-ink/40" style={{ opacity: 0 }} />
          ))}
        </>
      );
    case "pet-insurance":
      return (
        <div className="sc s-face absolute top-0 left-0 z-20" style={{ opacity: 0 }}>
          <div className="s-face-part relative">
            <span className="s-eye absolute top-[14%] left-[27%] aspect-square w-[11%] rounded-full bg-ink" />
            <span className="s-eye absolute top-[14%] right-[27%] aspect-square w-[11%] rounded-full bg-ink" />
            {/* nose, then a little tongue */}
            <span className="absolute top-[38%] left-1/2 h-[15%] w-[24%] -translate-x-1/2 rounded-[45%_45%_55%_55%] bg-ink" />
            <span className="s-tongue absolute top-[56%] left-1/2 h-[20%] w-[15%] origin-top -translate-x-1/2 rounded-b-full bg-red" />
          </div>
        </div>
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
          <svg
            className="sc s-glow absolute -top-[4%] left-[1%] h-[26%] w-[97%] overflow-visible"
            viewBox="0 0 800 120"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="house-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fbe6e9" />
                <stop offset="1" stopColor="#fdf3f4" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path fill="url(#house-glow)" style={{ opacity: 0 }} />
          </svg>
          <span className="sc s-house-window absolute top-0 left-0 z-20 size-[18px] rounded-[3px] bg-red" />
          {[0, 1, 2].map((i) => (
            <span key={i} className="sc s-smoke absolute top-0 left-0 z-20 size-3 rounded-full bg-ink/20 blur-[1px]" style={{ opacity: 0 }} />
          ))}
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
              <span
                key={p.slug}
                className="sc s-parade absolute top-0 left-0 z-20 grid size-8 place-items-center rounded-xl bg-white shadow-[0_8px_18px_-10px_rgb(10_34_41/0.45)] ring-1 ring-ink/8 sm:size-10"
              >
                <Icon className="size-4 text-ink sm:size-5" strokeWidth={1.75} />
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
      const morphs = ["health-insurance", "umbrella-insurance", "homeowners-insurance", "bundle", "pet-insurance", "auto-insurance"].includes(kind);
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
      className={`pointer-events-none absolute inset-0 ${kind === "business-insurance" || kind === "homeowners-insurance" ? "z-0" : "z-20"}`}
      style={{ clipPath: "inset(-30% 0 0 0)" }}
    >
      <Markup kind={kind} />
    </div>
  );
}
