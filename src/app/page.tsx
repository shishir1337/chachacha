import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Coverage from "@/components/Coverage";
import BundleBuilder from "@/components/BundleBuilder";
import Process from "@/components/Process";
import LifeMoments from "@/components/LifeMoments";
import WhyUs from "@/components/WhyUs";
import Compare from "@/components/Compare";
import Faq from "@/components/Faq";
import Journal from "@/components/Journal";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { Cursor, Intro, ScrollProgress } from "@/components/motion";

export default function Home() {
  return (
    <>
      <Intro />
      <ScrollProgress />
      <Cursor />
      <Nav />
      <main id="main">
        <Hero />
        <Statement />
        <Coverage />
        <BundleBuilder />
        <Process />
        <LifeMoments />
        <WhyUs />
        <Compare />
        <Faq />
        <Journal />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
