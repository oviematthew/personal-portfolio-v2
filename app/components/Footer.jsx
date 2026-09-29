import React from "react";
import { FaInstagram, FaXTwitter, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import GetCurrentYear from "../utils/GetCurrentYear";

const SOCIALS = [
  { href: "https://github.com/oviematthew", label: "GitHub", Icon: FaGithub },
  { href: "https://www.linkedin.com/in/matthew-ovie-enamuotor-9992b6132/", label: "LinkedIn", Icon: FaLinkedin },
  { href: "https://x.com/oviematthew_", label: "X (Twitter)", Icon: FaXTwitter },
  { href: "https://www.instagram.com/oviematthew_/", label: "Instagram", Icon: FaInstagram },
  { href: "mailto:hello@oviematthew.com", label: "Email", Icon: FaEnvelope },
];

const LEGAL = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookie-policy", label: "Cookies" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <Image src="/media/footer-icon.png" alt="Ovie" width={56} height={56} className="h-14 w-14 object-cover" />

          <div className="flex items-center gap-6">
            {SOCIALS.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                aria-label={label}
                className="text-neutral-300 transition duration-300 hover:text-brand active:scale-95"
              >
                <Icon size={20} />
              </Link>
            ))}
          </div>
        </div>

        {/* Legal links, then the copyright line last so it sits at the very bottom on mobile */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-neutral-400 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 md:order-2">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="md:order-1">
            © <GetCurrentYear /> Matthew Ovie Enamuotor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
