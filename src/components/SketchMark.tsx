"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

/**
 * The footer wordmark: "ChaCha Insurance" in the site face, in soft, quiet tones.
 */
export default function SketchMark() {
  const svg = useRef<SVGSVGElement>(null);
  const inView = useInView(svg, { once: true, amount: 0.4 });
  const [box, setBox] = useState("0 0 1200 260");

  // Fit the viewBox to the real text once the fonts are in.
  useEffect(() => {
    let off = false;
    document.fonts.ready.then(() => {
      const g = svg.current?.querySelector<SVGGElement>(".mark");
      if (!g || off) return;
      const b = g.getBBox();
      setBox(`${b.x - 12} ${b.y - 12} ${b.width + 24} ${b.height + 24}`);
    });
    return () => {
      off = true;
    };
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
          x="0"
          y="200"
          fontSize="200"
          style={{ fontFamily: "var(--font-mona), system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.045em" }}
        >
          <tspan fill="rgb(208 20 44 / 0.2)">ChaCha</tspan>
          <tspan fill="rgb(29 26 32 / 0.09)"> Insurance</tspan>
        </text>
      </g>
    </motion.svg>
  );
}
