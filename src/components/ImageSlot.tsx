import Image from "next/image";
import clsx from "clsx";
import { ImageIcon } from "lucide-react";
import { images, type ImageKey, type ImageSpec } from "@/lib/images";

type Props = {
  slot: ImageKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  tone?: "light" | "dark";
  /** Fill the parent instead of using the slot's aspect ratio. */
  fill?: boolean;
};

export default function ImageSlot({
  slot,
  className,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority,
  tone = "light",
  fill,
}: Props) {
  const spec: ImageSpec = images[slot];
  const style = fill ? undefined : { aspectRatio: spec.ratio };

  if (spec.ready) {
    return (
      <div className={clsx("relative overflow-hidden", fill && "h-full w-full", className)} style={style}>
        <Image
          src={`/img/${spec.file}`}
          alt={spec.alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={90}
          className="object-cover"
          style={spec.position ? { objectPosition: spec.position } : undefined}
        />
      </div>
    );
  }

  // Quiet placeholder: the subject up front, the full generation prompt tucked behind a toggle.
  const dark = tone === "dark";
  return (
    <div
      role="img"
      aria-label={spec.alt}
      className={clsx(
        "relative flex overflow-hidden",
        dark ? "bg-gradient-to-b from-night-2 to-night text-white" : "bg-gradient-to-b from-mist/70 to-porcelain text-ink",
        fill && "h-full w-full",
        className,
      )}
      style={style}
    >
      <div className="m-auto flex w-full max-w-[18rem] flex-col items-center gap-3 p-6 text-center">
        <span
          className={clsx(
            "grid size-10 place-items-center rounded-full",
            dark ? "bg-white/10 text-white/70" : "bg-white text-slate ring-1 ring-ink/5",
          )}
        >
          <ImageIcon className="size-4" aria-hidden />
        </span>
        <p className={clsx("text-sm leading-snug", dark ? "text-white/70" : "text-slate")}>{spec.alt}</p>
        <details className={clsx("w-full text-xs", dark ? "text-white/50" : "text-slate/80")}>
          <summary className="cursor-pointer list-none underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
            View prompt
          </summary>
          <p className="mt-3 max-h-32 overflow-auto text-left leading-relaxed">{spec.prompt}</p>
          <p className="mt-2 text-left">
            Save as <span className="font-semibold">/public/img/{spec.file}</span>
          </p>
        </details>
      </div>
    </div>
  );
}
