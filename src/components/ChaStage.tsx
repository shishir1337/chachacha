"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { INTRO_DELAY } from "./motion";
import HeroScene from "./HeroScene";

const WORDS = ["Cha", "Cha", "Cha."];
const BASE_W = 112;
const REST = { px: 400, py: 8 };

/** A tiny damped spring, integrated per frame. */
type Spring = { x: number; v: number };
const spring = (s: Spring, target: number, dt: number, k = 170, c = 15) => {
  s.v += (k * (target - s.x) - c * s.v) * dt;
  s.x += s.v * dt;
};

function roofPath(px: number, py: number) {
  const a = 6 + (px - 6) * 0.45;
  const b = 6 + (px - 6) * 0.8;
  const c = px + (794 - px) * 0.2;
  const d = px + (794 - px) * 0.55;
  return `M6 112 C ${a} 100, ${b} ${py + 30}, ${px} ${py} C ${c} ${py + 26}, ${d} 84, 794 104`;
}

/**
 * The signature "Cha Cha Cha." line.
 * The roof from the logo follows the pointer and settles over whatever it is near,
 * the nearest word stretches and lifts, and a tap makes a word hop.
 * When nobody is interacting the three words keep a quiet one-two-three beat.
 */
export default function ChaStage({ scene, sceneKey }: { scene: string | null; sceneKey: number }) {
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const inners = useRef<(HTMLSpanElement | null)[]>([]);
  const hops = useRef<(HTMLSpanElement | null)[]>([]);
  const roofKick = useRef<{ px?: number; vy: number }>({ vy: 0 });
  // Hold the idle beat while a picked-cover scene is playing.
  const quietUntil = useRef(0);
  useEffect(() => {
    if (sceneKey > 0) quietUntil.current = performance.now() + 5500;
  }, [sceneKey]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = WORDS.map(() => ({
      w: { x: BASE_W, v: 0 } as Spring,
      g: { x: 760, v: 0 } as Spring,
      lift: { x: 0, v: 0 } as Spring,
      rot: { x: 0, v: 0 } as Spring,
      ready: true,
      boost: 0,
    }));
    const roof = { px: { x: REST.px, v: 0 } as Spring, py: { x: REST.py, v: 0 } as Spring };
    const pointer = { x: 0, y: 0, active: false, last: 0 };
    let centers: { x: number; y: number; w: number }[] = [];
    let svgRect: DOMRect | null = null;
    let visible = true;
    const stacked = false;

    const measure = () => {
      svgRect = svg.current?.getBoundingClientRect() ?? null;
      centers = inners.current.map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
      });
    };

    // Words land one per beat, in step with the hero's entrance timeline.

    const onMove = (e: PointerEvent) => {
      const r = stage.current!.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (inside) {
        if (!pointer.active) measure();
        pointer.last = performance.now();
      }
      pointer.active = inside;
    };
    const onScroll = () => {
      pointer.active = false;
    };

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(stage.current!);

    // Idle beat: one, two, three.
    const beat = window.setInterval(() => {
      if (!visible || pointer.active || !words.every((w) => w.ready)) return;
      if (performance.now() - pointer.last < 2500 || performance.now() < quietUntil.current) return;
      words.forEach((w, i) => window.setTimeout(() => (w.boost = 1), i * 240));
    }, 9000);

    let raf = 0;
    let prev = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - prev) / 1000, 1 / 30);
      prev = now;
      if (!visible) return;
      if (pointer.active && frame++ % 20 === 0) measure();

      // Pointer influence on each word.
      const inf = words.map((_, i) => {
        if (!pointer.active || !centers[i]) return 0;
        const c = centers[i];
        const dx = pointer.x - c.x;
        const dy = stacked ? pointer.y - c.y : (pointer.y - c.y) * 0.35;
        const d = Math.hypot(dx, dy) / (c.w * 0.8);
        return Math.exp(-d * d);
      });

      let targetsW = words.map((w, i) => {
        if (!w.ready) return 75;
        if (pointer.active) return 104 + 14 * inf[i];
        return BASE_W + 13 * w.boost;
      });
      // Keep the line the same overall width on wide screens so it never wraps.
      if (pointer.active && !stacked && words.every((w) => w.ready)) {
        const sum = targetsW.reduce((a, b) => a + b, 0);
        targetsW = targetsW.map((t) => Math.min(125, Math.max(75, (t * BASE_W * 3) / sum)));
      }

      words.forEach((w, i) => {
        w.boost *= Math.exp(-dt * 4.5);
        spring(w.w, targetsW[i], dt, 90, 16);
        spring(w.g, pointer.active ? 720 + 80 * inf[i] : 760, dt, 90, 16);
        spring(w.lift, pointer.active ? -3 * inf[i] : -4 * w.boost, dt, 120, 16);
        const lean = pointer.active && centers[i] ? Math.max(-1, Math.min(1, (pointer.x - centers[i].x) / centers[i].w)) : 0;
        spring(w.rot, 0.8 * lean * inf[i], dt, 90, 16);
        const el = inners.current[i];
        if (el) {
          el.style.fontVariationSettings = `"wdth" ${w.w.x.toFixed(1)}, "wght" ${Math.min(900, w.g.x).toFixed(0)}`;
          el.style.transform = `translateY(${w.lift.x.toFixed(2)}%) rotate(${w.rot.x.toFixed(2)}deg)`;
        }
      });

      // The roof follows the pointer, dips lower (covers more) the closer you get,
      // and during the idle beat it steps over whichever word is dancing.
      let tpx = REST.px;
      let tpy = REST.py;
      if (pointer.active && svgRect) {
        // The roof leans gently toward the pointer rather than chasing it.
        tpx = REST.px + (((pointer.x - svgRect.left) / svgRect.width) * 800 - REST.px) * 0.3;
        tpy = 8 + 8;
      } else {
        const dancing = words.findIndex((w) => w.boost > 0.5);
        if (dancing >= 0 && svgRect && centers[dancing]) {
          tpx = ((centers[dancing].x - svgRect.left) / svgRect.width) * 800;
        } else if (dancing >= 0) {
          measure();
        }
      }
      if (roofKick.current.px !== undefined) {
        tpx = roofKick.current.px;
      }
      if (roofKick.current.vy) {
        roof.py.v += roofKick.current.vy;
        roofKick.current.vy = 0;
      }
      spring(roof.px, Math.max(90, Math.min(710, tpx)), dt, 60, 14);
      spring(roof.py, tpy, dt, 80, 14);
      if (!path.current?.dataset.locked) path.current?.setAttribute("d", roofPath(roof.px.x, Math.max(-20, Math.min(60, roof.py.x))));
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(beat);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  function hop(i: number) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = hops.current[i];
    const inner = inners.current[i];
    if (!el || !inner) return;
    gsap.killTweensOf(el);
    gsap
      .timeline()
      .to(el, { yPercent: -24, scaleY: 1.1, scaleX: 0.93, duration: 0.2, ease: "power2.out" })
      .to(el, { yPercent: 0, scaleY: 0.88, scaleX: 1.1, duration: 0.16, ease: "power2.in" })
      .to(el, { scaleY: 1, scaleX: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" });
    

    // Pop the roof up over the word that hopped.
    const s = svg.current?.getBoundingClientRect();
    const r = inner.getBoundingClientRect();
    if (s) {
      roofKick.current.px = ((r.left + r.width / 2 - s.left) / s.width) * 800;
      roofKick.current.vy = -520;
      window.setTimeout(() => (roofKick.current.px = undefined), 900);
    }
  }

  return (
    <div ref={stage} aria-hidden className="cha-row relative [--roof-w:clamp(3.5px,0.42vw,6px)] w-fit max-w-full pt-[max(1.75rem,3vw)] pb-[max(3rem,4vw)] select-none">
      {scene && <HeroScene key={sceneKey} kind={scene} delay={0.05} />}
      <svg
        ref={svg}
        className="hero-roof pointer-events-none absolute -top-[4%] left-[1%] z-10 h-[26%] w-[97%] overflow-visible text-red"
        viewBox="0 0 800 120"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          ref={path}
          d={roofPath(REST.px, REST.py)}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="[stroke-width:var(--roof-w)]"
        />
      </svg>
      <p className="font-display relative z-10 -mx-[0.06em] flex items-baseline gap-x-[0.16em] overflow-hidden px-[0.06em] pt-[0.12em] pb-[0.04em] text-[min(13vw,17vh,11rem)] xl:text-[min(13vw,17vh,11rem,calc((min(100vw,88rem)_-_24.75rem)/6.75))] leading-[0.9] font-bold tracking-[-0.045em] text-ink">
        {WORDS.map((word, i) => (
          <span
            key={i}
            className="cha inline-block origin-bottom"
          >
            <span
              ref={(el) => {
                hops.current[i] = el;
              }}
              onPointerDown={() => hop(i)}
              className="cha-hop inline-block origin-bottom cursor-pointer"
            >
              <span
                ref={(el) => {
                  inners.current[i] = el;
                }}
                className="inline-block origin-bottom will-change-transform"
                style={{ fontVariationSettings: `"wdth" ${BASE_W}, "wght" 760` }}
              >
                {word}
              </span>
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}
