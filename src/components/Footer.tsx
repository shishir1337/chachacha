import Image from "next/image";
import Link from "next/link";
import { categories, contact } from "@/lib/content";
import FluidWord from "./FluidWord";

const company = [
  { label: "About us", href: "/about-us" },
  { label: "Request service", href: "/service" },
  { label: "Blog", href: "/blog" },
  { label: "Contact us", href: "/contact-us" },
];
const legal = [
  { label: "Terms of service", href: "/terms-of-service" },
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Licenses", href: "/licenses" },
];

function Col({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="font-medium transition-colors hover:text-teal">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const products = categories.flatMap((c) => c.products).map((p) => ({ label: p.name, href: `/${p.slug}` }));

  return (
    <footer className="pt-20 pb-10 sm:pt-28">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Image src="/chacha-logo-full.png" alt="ChaCha Insurance" width={788} height={316} className="h-16 w-auto" />
            <p className="mt-6 max-w-sm text-slate">
              ChaCha Insurance is an independent agency. We shop multiple insurance companies to find individuals, families and
              businesses affordable, reliable coverage, then help you pick the policy that actually fits.
            </p>
            <div className="mt-8 space-y-1">
              <a href={contact.phoneHref} className="font-display block text-3xl font-bold tracking-tight transition-colors hover:text-teal">
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="block font-medium transition-colors hover:text-teal">
                {contact.email}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-semibold text-slate">Insurance</h3>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-1">
                {products.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="font-medium transition-colors hover:text-teal">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Col title="Company" items={company} />
            <Col title="Legal" items={legal} />
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-semibold text-slate">Visit or write</h3>
              <address className="mt-4 not-italic">
                {contact.address.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
              <p className="mt-4 text-sm text-slate">{contact.hours}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {contact.social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ring-1 ring-ink/15 transition-colors hover:bg-ink hover:text-white"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8">
          <FluidWord
            text="ChaCha Insurance"
            style={{ backgroundImage: "linear-gradient(90deg, rgb(29 26 32 / 0.07), rgb(27 107 102 / 0.16) 50%, rgb(29 26 32 / 0.07))" }}
            className="font-display overflow-hidden bg-clip-text text-center text-[min(9.2vw,8.1rem)] leading-[0.9] font-black tracking-[-0.05em] whitespace-nowrap text-transparent select-none"
          />
        </div>

        <div className="mt-10 grid gap-6 border-t border-ink/10 pt-8 text-sm text-slate lg:grid-cols-[1fr_2fr]">
          <p>&copy; {new Date().getFullYear()} ChaCha Insurance Agency, Inc. All rights reserved.</p>
          <p>
            ChaCha Insurance Agency, Inc. is an independent insurance agency. Coverage descriptions on this site are general
            summaries, not an offer of insurance, and do not change the terms of any policy. Actual coverage depends on policy
            language, underwriting and availability in your state.
          </p>
        </div>
      </div>
    </footer>
  );
}
