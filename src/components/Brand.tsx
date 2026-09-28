import { Fragment, type ReactNode } from "react";
import clsx from "clsx";

/**
 * "ChaCha" and "Cha Cha (Cha)" always appear in the Haydon Brush signature face.
 * The brush face draws much smaller than the site fonts, so it is scaled up to read at the same size as the words around it
 * (less in big headings, where it is already large).
 */
export function Brand({ children = "ChaCha", size = 1.4, className }: { children?: ReactNode; size?: number; className?: string }) {
  return (
    <span className={clsx("font-brush leading-none font-normal tracking-normal", className)} style={{ fontSize: `${size}em` }}>
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
