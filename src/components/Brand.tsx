import { Fragment, type ReactNode } from "react";
import clsx from "clsx";

/*
 * Haydon Brush draws its letters well above the line and smaller than the site fonts.
 * Measured with canvas (per 100px): the brush "ha" ink runs from 16px to 78px above the baseline,
 * while a capital in Hanken / Mona Sans runs from 0 to 70-73px.
 * So inside other text the word is lowered by 0.16 of its own size (its letters land on the line)
 * and set at 1.16x the surrounding size (its letters reach the height of the capitals beside it).
 */
const SIZE = 1.16;
const DROP = "0.16em";

/** "ChaCha" and "Cha Cha (Cha)" always appear in the Haydon Brush signature face, sitting on the same line as the text around it. */
export function Brand({ children = "ChaCha", className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={clsx("font-brush relative leading-none font-normal tracking-normal", className)} style={{ fontSize: `${SIZE}em`, top: DROP }}>
      {children}
    </span>
  );
}

const WORD = /(Cha ?Cha(?: Cha)?\.?)/g;

/** Set every "ChaCha" / "Cha Cha" inside a plain string in the brand face. */
export function withBrand(text: string): ReactNode {
  const parts = text.split(WORD);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 ? <Brand key={i}>{part}</Brand> : <Fragment key={i}>{part}</Fragment>));
}
