import type { Metadata, Viewport } from "next";
import { Kaushan_Script, Mona_Sans, Hanken_Grotesk } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const mona = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// Stand-in brush face for the footer wordmark. Swap for Haydon Brush (next/font/local) once licensed.
const brush = Kaushan_Script({
  variable: "--font-brush",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "ChaCha Insurance is an independent agency. We shop dozens of insurance companies to find individuals, families and businesses affordable, reliable coverage.";

export const metadata: Metadata = {
  metadataBase: new URL("https://chachainsurance.com"),
  title: "ChaCha Insurance | Car, life, business, home & health",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ChaCha Insurance",
    title: "ChaCha Insurance | Better rates, easy as Cha Cha Cha",
    description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", site: "@ChachaInsurance" },
};

// Structured data so search engines understand who we are.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  name: "ChaCha Insurance",
  legalName: "ChaCha Insurance Agency, Inc.",
  url: "https://chachainsurance.com",
  logo: "https://chachainsurance.com/chacha-logo-full.png",
  telephone: "+1-888-888-9914",
  email: "info@chachainsurance.com",
  description,
  address: {
    "@type": "PostalAddress",
    streetAddress: "109 E 17th Street, Suite 80",
    addressLocality: "Cheyenne",
    addressRegion: "WY",
    postalCode: "82001",
    addressCountry: "US",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: [
    "https://www.facebook.com/chachainsurance/",
    "https://twitter.com/ChachaInsurance",
    "https://www.youtube.com/channel/UCSO1Qsvczrg3qA6F59Z5GDg",
  ],
};

export const viewport: Viewport = {
  themeColor: "#f2f3f6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${mona.variable} ${hanken.variable} ${brush.variable} antialiased`}
    >
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
