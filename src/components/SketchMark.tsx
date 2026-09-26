"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";

/** Colours shared with the uncle mascot. */
const C = {
  skin: "#f3c7a0",
  skinShade: "#e2a882",
  navy: "#1f2a44",
  navyShade: "#16203a",
  trousers: "#2b2f3a",
  trousersBack: "#20242e",
  silver: "#c9cfd7",
  silverShade: "#9aa3ae",
  shoe: "#5a3b2b",
};

/**
 * The uncle, curled up asleep in the bowl of a "C" like a hammock.
 * Drawn in a 140 x 84 box; (0, 84) is the bottom-left where the bowl's inner wall meets its floor.
 * His head rests against the left wall, his back follows the curve, knees up, feet over the lip.
 */
function Napper() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {/* back leg */}
      <path d="M70 66 L94 44 L114 55" stroke={C.trousersBack} strokeWidth="11" fill="none" />
      <ellipse cx="117" cy="57.5" rx="7" ry="4" transform="rotate(28 117 57.5)" fill="#4a3022" />
      {/* torso lying along the curve */}
      <path d="M30 50 C 40 60, 55 68, 72 68" stroke={C.navy} strokeWidth="25" fill="none" />
      <path d="M40 66 C 50 72, 62 75, 74 75" stroke={C.navyShade} strokeWidth="5" fill="none" opacity="0.55" />
      {/* shirt, waistcoat and bow tie at the collar */}
      <path d="M27 42 C 30 46, 35 49, 40 50 L 34 56 Z" fill="#fff" />
      <path d="M33 50 L 40 51 L 36 56 Z" fill="#1b6b66" />
      <path d="M30 44 L 24 39 L 23 47 Z M30 44 L 35 38 L 37 46 Z" fill="#d0142c" />
      <circle cx="30" cy="44" r="2.2" fill="#a10f22" />
      {/* front leg, knee up */}
      <path d="M72 64 L99 41 L123 56" stroke={C.trousers} strokeWidth="12" fill="none" />
      <ellipse cx="127" cy="58.5" rx="8" ry="4.5" transform="rotate(30 127 58.5)" fill={C.shoe} />
      {/* arms folded on his belly */}
      <path d="M38 55 C 44 62, 50 63, 56 60" stroke={C.navyShade} strokeWidth="9" fill="none" />
      <circle cx="58" cy="59" r="4.6" fill={C.skin} />
      <path d="M44 51 C 50 57, 58 58, 63 54" stroke={C.navy} strokeWidth="9" fill="none" />
      <circle cx="65" cy="53" r="4.6" fill={C.skin} />
      {/* head, tilted back against the wall */}
      <g transform="rotate(-18 20 30)">
        <ellipse cx="20" cy="30" rx="15" ry="16" fill={C.skin} />
        <path d="M5 30 C 3 18, 11 11, 20 12 C 29 12, 36 18, 35 26 C 33 21, 30 18, 26 17.5 C 22 20, 15 20, 12 17.5 C 8 20, 6 24, 5 30 Z" fill={C.silver} />
        <ellipse cx="4.5" cy="31" rx="3.4" ry="3.8" fill={C.skinShade} />
        {/* closed eyes behind round glasses */}
        <circle cx="14.5" cy="29" r="4.6" fill="#fff" fillOpacity="0.18" stroke="#3a3d45" strokeWidth="1.3" />
        <circle cx="25.5" cy="29" r="4.6" fill="#fff" fillOpacity="0.18" stroke="#3a3d45" strokeWidth="1.3" />
        <path d="M18.8 28.7 Q20 27.7 21.2 28.7" stroke="#3a3d45" strokeWidth="1.1" fill="none" />
        <path d="M12 30 Q14.5 31.8 17 30" stroke="#1d1a20" strokeWidth="1.3" fill="none" />
        <path d="M23 30 Q25.5 31.8 28 30" stroke="#1d1a20" strokeWidth="1.3" fill="none" />
        <circle cx="12" cy="35" r="2.6" fill="#ef8f86" opacity="0.35" />
        <circle cx="28" cy="35" r="2.6" fill="#ef8f86" opacity="0.35" />
        <ellipse cx="20" cy="34.5" rx="2.9" ry="2.4" fill={C.skinShade} />
        {/* the grand mustache */}
        <path
          d="M20 37 C 16.5 36, 11.5 36, 7.5 39 C 5.3 40.6, 2.7 40.3, 1.7 38 C 1.7 42.6, 7 45.2, 12.2 43.3 C 15.4 42.2, 18 41, 20 40.3 C 22 41, 24.6 42.2, 27.8 43.3 C 33 45.2, 38.3 42.6, 38.3 38 C 37.3 40.3, 34.7 40.6, 32.5 39 C 28.5 36, 23.5 36, 20 37 Z"
          fill={C.silver}
        />
        <path d="M20 37 C 23.5 36, 28.5 36, 32.5 39 C 34.7 40.6, 37.3 40.3, 38.3 38 C 38.3 42.6, 33 45.2, 27.8 43.3 C 24.6 42.2, 22 41, 20 40.3 Z" fill={C.silverShade} opacity="0.5" />
        {/* nightcap: red with a white band, flopping over to the side, bobble at the tip */}
        <path d="M4.5 21 C 8 9, 20 4, 30 8 C 38 11, 44 16, 47 24 C 43 20, 38 18, 34 18.5 C 32 16, 20 15, 4.5 21 Z" fill="#d0142c" />
        <path d="M30 8 C 36 10, 42 15, 45 21" stroke="#a10f22" strokeWidth="1.4" fill="none" opacity="0.7" />
        <path d="M3.5 22.5 C 12 16.5, 26 15.5, 35 19" stroke="#fff" strokeWidth="4.2" fill="none" />
        <circle cx="47.5" cy="25" r="3.6" fill="#fff" />
      </g>
    </g>
  );
}

/**
 * The footer wordmark: "ChaCha Insurance" in the site face, in soft, quiet tones.
 * When the uncle reaches the footer he curls up for a nap inside the first "C".
 */
export default function SketchMark() {
  const svg = useRef<SVGSVGElement>(null);
  const text = useRef<SVGTextElement>(null);
  const inView = useInView(svg, { once: true, amount: 0.4 });
  const [box, setBox] = useState("0 0 1200 260");
  const [bowl, setBowl] = useState<{ x: number; y: number; s: number } | null>(null);
  const [napping, setNapping] = useState(false);

  // Fit the viewBox to the real text once the fonts are in, and find the bowl of the first "C".
  useEffect(() => {
    let off = false;
    document.fonts.ready.then(() => {
      const g = svg.current?.querySelector<SVGGElement>(".mark");
      if (!g || off || !text.current) return;
      const b = g.getBBox();
      setBox(`${b.x - 12} ${b.y - 12} ${b.width + 24} ${b.height + 24}`);
      const c = text.current.getExtentOfChar(0);
      const stroke = 200 * 0.165; // Mona Sans ExtraBold stem, in em units of this 200px text
      const innerW = c.width - stroke;
      const s = (innerW * 1.02) / 140;
      // bottom-left of the bowl's inside: just inside the left stem, resting on the lower stroke
      setBowl({ x: c.x + stroke * 0.9, y: 200 - stroke * 0.84 - 84 * s, s });
    });
    return () => {
      off = true;
    };
  }, []);

  useEffect(() => {
    const on = (e: Event) => setNapping((e as CustomEvent<boolean>).detail);
    window.addEventListener("roofie:nap", on);
    return () => window.removeEventListener("roofie:nap", on);
  }, []);

  return (
    <motion.svg
      ref={svg}
      viewBox={box}
      role="img"
      aria-label="ChaCha Insurance"
      className="block h-auto w-full overflow-visible select-none"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <g className="mark">
        <text
          ref={text}
          x="0"
          y="200"
          fontSize="200"
          style={{ fontFamily: "var(--font-mona), system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.045em" }}
        >
          <tspan fill="rgb(208 20 44 / 0.2)">ChaCha</tspan>
          <tspan fill="rgb(29 26 32 / 0.09)"> Insurance</tspan>
        </text>
      </g>

      <AnimatePresence>
        {bowl && napping && (
          <motion.g
            key="nap"
            aria-hidden
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <g transform={`translate(${bowl.x} ${bowl.y}) scale(${bowl.s})`}>
              {/* slow breathing */}
              <motion.g
                animate={{ scaleY: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "60px 84px", transformBox: "view-box" }}
              >
                <Napper />
              </motion.g>
              {/* z z z */}
              {[0, 1, 2].map((i) => (
                <motion.text
                  key={i}
                  x={30 + i * 10}
                  y={8}
                  fontSize={10 + i * 4}
                  fontWeight={700}
                  fill="#5c5864"
                  style={{ fontFamily: "var(--font-mona), system-ui, sans-serif" }}
                  animate={{ y: [8, -22], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: 0.6 + i * 0.9, ease: "easeOut" }}
                >
                  z
                </motion.text>
              ))}
            </g>
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}
