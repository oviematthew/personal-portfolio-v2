import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <Link href="/" className="group mt-10 inline-flex items-center gap-2 text-neutral-400 transition hover:text-white">
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Home
      </Link>

      <h1 className="mt-10 text-5xl font-semibold leading-[1] tracking-[-0.05em] md:text-8xl">
        {title}
        <span className="text-brand">.</span>
      </h1>
      <p className="mt-6 text-neutral-500">Last updated {updated}</p>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <nav aria-label="Legal pages" className="lg:col-span-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:sticky lg:top-28 lg:flex-col lg:gap-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={l.label === title ? "page" : undefined}
                  className={`transition-colors hover:text-brand ${l.label === title ? "text-white" : "text-neutral-500"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-2xl space-y-12 text-lg leading-relaxed text-neutral-300 lg:col-span-9">
          <p>{intro}</p>
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-white">{s.heading}</h2>
              <div className="space-y-4">
                {s.body.map((b, i) => (
                  <p key={i}>{b}</p>
                ))}
                {s.list && (
                  <ul className="list-disc space-y-2 pl-6">
                    {s.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
          <p>
            Questions? Email{" "}
            <a href="mailto:hello@oviematthew.com" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-brand">
              hello@oviematthew.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
