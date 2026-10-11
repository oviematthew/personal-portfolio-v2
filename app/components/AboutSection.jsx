import Link from "next/link";
import Reveal from "./Reveal";

const L = ({ href, children }) => (
  <Link href={href} target="_blank" className="link-brand">
    {children}
  </Link>
);

export default function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-[1400px] px-6 py-28 lg:py-40">
      <div className="max-w-4xl space-y-8 text-2xl font-medium leading-[1.4] tracking-tight text-neutral-400 md:text-3xl lg:text-[2.1rem]">
        <Reveal>
          <p>
            <span className="text-white">I&apos;m Ovie</span>, a frontend engineer based in London, Ontario. I build
            interfaces that are fast, accessible and easy to use.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <p>
            Now at <L href="https://rentsync.com">Rentsync</L>, building Vue applications for the real estate industry.
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
