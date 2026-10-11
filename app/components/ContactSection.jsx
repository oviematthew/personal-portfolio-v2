import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section id="contact" className="mx-auto max-w-[1400px] px-6 pb-32 pt-8 lg:pb-48">
      <h2 className="text-[clamp(3rem,9vw,9rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
        Have something
        <br />
        in mind<span className="text-brand">?</span>
      </h2>

      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Link
            href="mailto:hello@oviematthew.com"
            className="group inline-flex items-center gap-3 text-2xl font-medium tracking-tight transition-colors hover:text-brand md:text-4xl"
          >
            hello@oviematthew.com
            <ArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
          <p className="mt-6 max-w-sm leading-relaxed text-neutral-400">
            Or send a note with the form. You can also find me on{" "}
            <Link
              href="https://www.linkedin.com/in/matthew-ovie-enamuotor-9992b6132/"
              target="_blank"
              className="link-brand"
            >
              LinkedIn
            </Link>
            .
          </p>
        </div>

        <div className="lg:col-span-6">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
