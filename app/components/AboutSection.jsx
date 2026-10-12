import Link from "next/link";
import Reveal from "./Reveal";
import AboutGreeting from "./AboutGreeting";

const L = ({ href, children }) => (
  <Link href={href} target="_blank" className="link-brand">
    {children}
  </Link>
);

export default function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-[1400px] px-6 py-28 lg:py-40">
      <div className="max-w-4xl space-y-8 text-2xl font-medium leading-[1.4] tracking-tight text-neutral-400 md:text-3xl lg:text-[2.1rem]">
        {/* no vertical slide here: the hero greeting lands exactly on this line, so it must not move */}
        <Reveal rise={0}>
          <p>
            <AboutGreeting />
            <span className="text-white">Frontend engineer based in London, Ontario.</span> I like interfaces that load
            fast, work for everyone and feel obvious to use.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <p>
            Now a frontend developer at <L href="https://rentsync.com">Rentsync</L>, building web applications for the
            real estate industry. My toolkit spans React, Next.js and Vue on the web, and React Native, Swift and Kotlin
            on mobile.
            Before that, five years of <L href="https://anomalitech.com">freelancing</L>: 200+ websites for 130+ clients
            across four continents. At <L href="https://boas.co">BOAS</L> I helped move the store from a Shopify theme to
            a headless build on Strapi and the Shopify Storefront API.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p>
            B.Eng in Computer Engineering, then a postgrad in Mobile Application Development. I build for the keyboard user, the screen reader and the slow phone first. If it works for them, it works for everyone.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
