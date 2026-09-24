import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/content";
import { Button } from "./ui";
import { RevealText } from "./motion";

export default function Journal() {
  return (
    <section aria-labelledby="journal-title" className="bg-white py-28 sm:py-36 lg:py-44">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <RevealText id="journal-title" className="font-display max-w-3xl text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.035em]">
            Ways to pay less, written plainly.
          </RevealText>
          <Button href="/blog" variant="ghost">
            Read the blog
          </Button>
        </div>

        <ul className="mt-14 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((p, i) => (
            <li key={p.slug} className={i % 2 === 1 ? "lg:mt-16" : undefined}>
              <Link href={`/blog/${p.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-mist">
                  <Image
                    src={`/img/blog-${p.slug}.jpg`}
                    alt={p.alt}
                    fill
                    quality={90}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-teal backdrop-blur">
                    {p.tag}
                  </span>
                  <span
                    aria-hidden
                    className="absolute right-4 bottom-4 grid size-12 translate-y-3 place-items-center rounded-full bg-white text-night opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
                <p className="mt-5 text-sm text-slate">
                  {p.date}, {p.read} read
                </p>
                <h3 className="font-display mt-2 text-xl leading-snug font-semibold tracking-tight decoration-red decoration-2 underline-offset-4 group-hover:underline">
                  {p.title}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
